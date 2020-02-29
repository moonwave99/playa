const marked = require('marked');

function link(href, title, text) {
  return `<a class="link blue underline-hover" href="${href}">${text}</a>`
}

function heading(text, level) {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    <h${level} class="mt5">
      <a name="${escapedText}" class="anchor" href="#${escapedText}">
        <span class="header-link"></span>
      </a>
      ${text}
    </h${level}>
  `;
}

function paragraph(text) {
  return `<p class="lh-copy">${text}</p>`;
}

function codespan(code) {
  return `<code class="dark-pink">${code}</code>`;
}

module.exports = () => {
  const renderer = new marked.Renderer();

  renderer.heading = heading;
  renderer.paragraph = paragraph;
  renderer.link = link;
  renderer.codespan = codespan;

  return renderer;
}
