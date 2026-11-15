<h1 align="center">🛠 Contributing to the goome docs 🛠</h1>

<p align="center">
The <a href="https://github.com/goome-ui/.github/blob/main/CONTRIBUTING.md">org contributing guide</a> counts here too, this is the docs stuff on top.<br>
Small PRs that fix one thing please. Typos, samples that dont compile and pages that are just wrong are the best ones to send.
</p>

<details>
<summary align="center"><b>📋 The short version 📋</b></summary>

<p align="center">
• One fix or one new page per PR<br>
• PRs go against <b>dev</b>, not main<br>
• Run the Jekyll build before you send it<br>
• Screenshots are real goome output, never mockups or edited pictures<br>
• Every code sample has to compile or run against the current release<br>
• Dont hand edit the API reference pages, theyre generated<br>
• Dont touch the protected files, a bot closes the PR if you do<br>
• AI is fine, but say you used it, and you need to know what every line says
</p>
</details>

<details>
<summary align="center"><b>✏️ Typos And New Pages ✏️</b></summary>

<p align="center">
Pages are markdown files in <code>pages/</code>. For a typo just hit the pencil on GitHub and send the PR against dev, no build needed.
<br> <br>
New page:<br>
• <code>pages/your-page.md</code> with a <code>title</code> in the front matter and one <code># heading</code> at the top<br>
• Add it to <code>_data/nav.yml</code> (the sidebar) and the index in <code>README.md</code> (GitHub)<br>
• Relative links like <code>[Hit rects](hit-rects.md)</code>, they work on GitHub and the site<br>
• Images go in <code>assets/shots/</code>, linked as <code>../assets/shots/name.png</code><br>
• C, C#, Python and Java samples for the same thing go right after each other, the site turns them into tabs<br>
• New stuff gets a <code>&lt;kbd&gt;0.3&lt;/kbd&gt;</code> tag with the version it came in, and <code>since: "0.3"</code> on its line in nav.yml
</p>
</details>

<details>
<summary align="center"><b>📸 Screenshots And Samples 📸</b></summary>

<p align="center">
Every picture is real goome output from the test backend, rendered with <code>GOOME_TEST_SHOTS</code> and turned into a PNG. No mockups, no photoshop, no cropping stuff out. If goome doesnt draw it like that the docs cant show it like that.<br> <br>
Say in the PR which program and test script made it so I can make it again. A PNG over 1 MB gets the PR closed.
<br> <br>
Samples have to actually compile (C, C#) or run (Python) against the current release. Try it before you send it and say in the PR that you did. One call snippets are fine but they still have to be right if someone pastes them into a real program.
</p>
</details>

<details>
<summary align="center"><b>📚 The API reference 📚</b></summary>

<p align="center">
<code>pages/api-*.md</code> gets made by <code>tools/apiref.py</code> from <code>goome.h</code> and its trailing <code>//</code> notes. Hand edits get wiped next time.<br> <br>
Something wrong in there? Fix the note in <code>include/goome.h</code> in <a href="https://github.com/goome-ui/c-goome">c-goome</a> and I remake the pages after it lands.<br> <br>
<code>pages/errors.md</code> is the same deal. <code>tools/errors.py</code> pulls every error message out of c-goome's <code>src/*.c</code>, and the explanations live in <code>tools/errors-notes.json</code>. After goome changes, run it with a c-goome checkout next to this repo (or give it the path):
</p>

```sh
python3 tools/errors.py ../c-goome
```

<p align="center">
It prints any message that has no explanation yet, and notes for messages that are gone. Write those up in the json and run it again.
</p>
</details>

<details>
<summary align="center"><b>👀 Previewing it 👀</b></summary>

<p align="center">
Its plain Jekyll, same as GitHub Pages. With Ruby:
</p>

```sh
gem install github-pages
jekyll serve --baseurl ""
```

<p align="center">
Or with docker, using the image GitHub Pages builds with:
</p>

```sh
docker run --rm -v "$PWD":/srv -w /srv --entrypoint jekyll ghcr.io/actions/jekyll-build-pages:v1.0.13 build --baseurl "" -d _site
python3 -m http.server -d _site
```

<p align="center">
It has to build without errors. Check your page in a phone sized window too.
</p>
</details>

<details>
<summary align="center"><b>🚫 What gets closed automatically 🚫</b></summary>

<p align="center">
A bot closes the PR with a comment if it hits any of these. Fix it and open a new one.<br> <br>
• Not against dev<br>
• Anything in <code>.github/</code> (CI and these rules)<br>
• <code>tools/</code>, the scripts that make the API pages<br>
• The site's look: <code>_config.yml</code>, <code>_layouts/</code>, <code>_includes/</code>, <code>_data/</code> outside of <code>nav.yml</code>, <code>assets/css/</code> and <code>assets/js/</code><br>
• The UI builder in <code>builder/</code>, send builder fixes as an issue<br>
• <code>assets/logo*</code> and <code>LICENSE</code><br>
• The generated API pages, <code>pages/api-*.md</code> and <code>api/</code><br>
• Any file over 1 MB<br> <br>
Think one of those is wrong? <a href="https://github.com/goome-ui/docs/issues">Open an issue</a>.
</p>
</details>

<details>
<summary align="center"><b>💬 Discussions and first issues 💬</b></summary>
<p align="center">
Questions and stuff you made with goome go in <a href="https://github.com/goome-ui/c-goome/discussions">Discussions</a>.<br>
If you want something to work on, the <a href="https://github.com/goome-ui/docs/labels/good%20first%20issue">good first issue</a> ones are small. Comment on one before you start.
</p>
</details>

<p align="center">
By sending a PR you agree your changes go out under the same license as the rest of the repo (<a href="LICENSE">GPL-3.0</a>).
</p>
