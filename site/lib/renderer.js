const marked = require('marked');

function link(href, title, text) {
  const target = href.indexOf('http') > -1 ? " target='_blank'" : null;
  return `<a class="link blue underline-hover" href="${href}"${target}>${text}</a>`
}

function heading(text, level) {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    <h${level} class="mt5">
      <a name="${escapedText}" class="anchor" href="#${escapedText}">
        <span class="link blue">#</span>
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
