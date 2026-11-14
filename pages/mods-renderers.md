---
title: Renderer backends
---

# Renderer backends <kbd>0.3</kbd>

These draw the goome frame on top of whatever the game drew. One header each in the `backends/` folder of [c-goome](https://github.com/goome-ui/c-goome/tree/main/backends), stb style: include it anywhere, and in exactly one .c file define its IMPLEMENTATION macro first. Theyre optional and only use the graphics api's own headers, goome.h itself still needs nothing. Open goome in [offscreen mode](offscreen-mode.md) before you init one.

```c
#define GOOME_IMPLEMENTATION
#include "goome.h"
#define GOOME_IMPL_GL3_IMPLEMENTATION
#include "goome_gl3.h"
```

| Header | For | init takes | render |
|:--|:--|:--|:--|
| `goome_gl3.h` | OpenGL 3.3 core, GLES 3 | a GL loader or NULL | `goome_gl3_render(g)` |
| `goome_gl2.h` | old fixed function GL, 1.1 works too | a GL loader or NULL | `goome_gl2_render(g)` |
| `goome_dx9.h` | Direct3D 9 | `IDirect3DDevice9 *` | `goome_dx9_render(g)` |
| `goome_dx11.h` | Direct3D 11 | device and immediate context | `goome_dx11_render(g)` |
| `goome_dx12.h` | Direct3D 12 | device, frames in flight, RTV format, one free SRV slot | `goome_dx12_render(g, cmd_list)` |
| `goome_vulkan.h` | Vulkan | a `goome_vulkan_info` | `goome_vulkan_render(g, cmd)` |
| `goome_metal.h` | Metal | the `MTLDevice` | `goome_metal_render(g, pass, encoder)` |

Each one also has `_resize(g, w, h, scale)`, which calls `goome_resize` and remakes the texture, and `_shutdown(g)`.

`render` goes after `goome_ui_end` and the game's own drawing. It only uploads the `goome_frame_dirty` part and draws one quad over the current viewport. Any state it touches gets saved and put back, the game's renderer doesnt notice.

## OpenGL

```c
goome_gl3_init(g, glfwGetProcAddress);
while (!glfwWindowShouldClose(win)) {
    glfwPollEvents();
    goome_glfw_frame(g);
    if (goome_ui_begin(u, 0)) {
        draw_menu(u);
        goome_ui_end(u);
    }
    draw_game();
    goome_gl3_render(g);
    glfwSwapBuffers(win);
}
goome_gl3_shutdown(g);
```

The loader is `goome_gl_proc (*)(const char *)`. NULL makes it use `wglGetProcAddress`, `glXGetProcAddress` or `eglGetProcAddress` itself, no glad or glew. SDL2's `SDL_GL_GetProcAddress` returns a `void *`, so wrap it. `goome_gl2_*` works exactly the same.

## Direct3D 9

```c
goome_dx9_init(g, device);
goome_dx9_render(g);
```

Render between the game's `BeginScene` and `EndScene`, it draws into the current render target.

## Direct3D 11

```c
goome_dx11_init(g, device, context);
goome_dx11_render(g);
```

It draws into whatever render target is bound on the context. The [dx11 mod](mods-native.md) binds the back buffer for it and puts the game's targets back after.

## Direct3D 12

```c
goome_dx12_init(g, device, 3, DXGI_FORMAT_R8G8B8A8_UNORM, srv_heap, srv_cpu, srv_gpu);
goome_dx12_render(g, cmd_list);
```

`srv_heap` is a shader visible `CBV_SRV_UAV` heap and `srv_cpu` / `srv_gpu` a slot in it goome can have. Frames in flight is 1 to 8. Record the render on a command list that has the back buffer as its render target, goome sets its own pipeline state on it.

## Vulkan

```c
goome_vulkan_info info = {
    .instance = instance,
    .physical_device = gpu,
    .device = device,
    .queue_family = family,
    .queue = queue,
    .render_pass = render_pass,
    .subpass = 0,
    .samples = VK_SAMPLE_COUNT_1_BIT,
    .get_proc = vkGetInstanceProcAddr,
};
goome_vulkan_init(g, &info);
goome_vulkan_render(g, cmd);
```

Same as `imgui_impl_vulkan`, call render inside a render pass on `cmd`. Uploads go on `queue` with their own fence. `get_proc` NULL makes it find the Vulkan loader itself.

## Metal

```c
goome_metal_init(g, device);
goome_metal_render(g, pass, encoder);
```

`device` is the `id<MTLDevice>`, `pass` the `MTLRenderPassDescriptor` and `encoder` the `MTLRenderCommandEncoder` for it, all as `void *`. No .m file, it talks to Metal through the objc runtime like the rest of goome on macOS, and it compiles to nothing off Apple.

## No backend for yours

Copy the frame into your own texture with `goome_frame_dirty` and `goome_frame_copy`, [How mods work](mods.md) has the code.
