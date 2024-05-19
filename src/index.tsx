import './index.css';
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view";
import { Schema, Node } from "prosemirror-model"
import { createSpecklePlugin } from './plugins/speckles';
import * as keymapModule from './plugins/keymap';
import getStatePlugin from './plugins/getState';

/**
 * https://prosemirror.net/docs/ref/#model.NodeSpec.group
 */
const schema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    star: {
      inline: true,
      group: "inline",
      toDOM() { return ["star", "🟊"] },
      parseDOM: [{ tag: "star" }]
    },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM() { return ["p", 0] },
      parseDOM: [{ tag: "p" }]
    },
    boring_paragraph: {
      group: "block",
      content: "text*",
      marks: "",
      toDOM() { return ["p", { class: "boring" }, 0] },
      parseDOM: [{ tag: "p.boring", priority: 60 }]
    },
    doc: {
      content: "block+"
    },
    smartCard: {
      inline: true,
      content: undefined,
      marks: "",
      group: 'inline',
      atom: true,
      attrs: {
        url: { default: '' },
      },
      leafText: (node) => `'[smartCard${node.attrs.url}]'`,
      selectable: true,
      draggable: false,
      code: false,
      toDOM: (node) => {
        const anchor = document.createElement('a');
        anchor.setAttribute('class', 'smartcard-block');
        anchor.setAttribute('contenteditable', 'false');
        anchor.setAttribute('href', node.attrs.url);
        anchor.innerHTML = `
          <p>DEMO smart link</p>
          <p>${node.attrs.url}</p>
          <p>DEMO assume smart link resolved</p>
        `;
        return anchor;
      }
    },
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null }
      },
      group: "inline",
      draggable: true,
      parseDOM: [{
        tag: "img[src]",
        getAttrs(dom: any) {
          return {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt")
          } as any
        }
      }],
      toDOM(node) {
        // let {src, alt, title} = node.attrs; return ["div", {src, alt, title}];
        const div = document.createElement('div');
        div.setAttribute('class', 'test-block');
        div.setAttribute('contenteditable', 'true');
        div.innerHTML = 'HAHAHAHAHAA'
        return div;
      }
    },
  },
});

console.log('debug::schema::', schema);

let doc = schema.node("doc", null, [
  schema.node("paragraph", null, [
    schema.text("123"),
    schema.node("star"),
    schema.node("smartCard", {
      url: 'https://google.com', alt: 'cat', title: 'CAT'
    }),
  ]),

  schema.node("paragraph", null, [
    schema.text("123"),
    schema.text("45"),
    schema.node("image", { src: 'https://t4.ftcdn.net/jpg/00/97/58/97/360_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg', alt: 'cat', title: 'CAT' }),
  ]),
  schema.node("paragraph", null, [
    schema.text("123"),
    schema.text("45"),
  ]),
  schema.node("paragraph", null, [
    schema.text("123"),
    schema.text("45"),
  ]),
  schema.node("paragraph", null, [
    schema.text("123"),
    schema.text("45"),
  ]),
]);

const speckles = createSpecklePlugin('#1');

function onState(state: any) {
  console.log('debug::state::', state);
}

let state = EditorState.create({
  schema,
  doc,
  plugins: [
    speckles.specklePlugin,
    keymapModule.keymap({}),
    getStatePlugin(onState),
  ]
});

let view = new EditorView(
  document.querySelector('#root'),
  {
    state,
    dispatchTransaction(transaction) {
      // const step = new ReplaceStep(3, 5, Slice.empty)
      // const result = view.state.tr.step(step);
      // view.state.apply(view.state.tr);

      const newState = view.state.apply(transaction);
      view.updateState(newState);
    }
  }
)

/**
 * The simplest setup
 */

document.getElementById('speckles-increment')?.addEventListener('click', () => {
  const transaction = view.state.tr;
  transaction.setMeta(speckles.specklePluginKey, { type: 'increment', payload: { by: 3 } });
  view.dispatch(transaction);
});

document.getElementById('speckles-decrement')?.addEventListener('click', () => {
  const transaction = view.state.tr;
  transaction.setMeta(speckles.specklePluginKey, { type: 'decrement', payload: { by: 2 } });
  view.dispatch(transaction);
  // view.updateState(view.state);
});

/**
 * Questions:
 * 1. How to dispatch a transaction?
 * 2. How to create a new plugin?
 * 3. How to ... how to... transform JSON to prosemirror and how to get prosemirror's model as JSON
 * 4. How to dispatch actions, reduce them, etc... within the plugin?
 */

const parsed = Node.fromJSON(schema, {
  type: 'paragraph',
  content: [
    {type: 'text', text: '123'},
    {type: 'star' },
    {
      attrs:  {url: 'https://google.com'},
      type: "smartCard"
    }
  ]
})

console.log('parsed', parsed);
console.log('parsed', parsed.textContent);