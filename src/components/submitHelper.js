import React from 'react';
import ReactDOM from 'react-dom';
import { cx, css } from 'emotion';
import { Text, createEditor, Transforms, Editor } from 'slate';
import { Slate, Editable, ReactEditor, withReact, useSlate } from 'slate-react';
import { useEditor, useSelected, useFocused } from 'slate-react';

export const insertImage = (editor, url = 'https://s3.amazonaws.com/pan.gaea/acacia.svg') => {
  const text = { text: '' };
  const image = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image);
};

export const isImageUrl = url => {
  if (!url) return false;
  return true;
};

export const withImages = editor => {
  const { exec, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.exec = command => {
    switch (command.type) {
      case 'insert_data': {
        const { data } = command;
        const text = data.getData('text/plain');
        const { files } = data;

        if (files && files.length > 0) {
          for (const file of files) {
            const reader = new FileReader();
            const [mime] = file.type.split('/');

            if (mime === 'image') {
              reader.addEventListener('load', () => {
                const url = reader.result;
                editor.exec({ type: 'insert_image', url });
              });

              reader.readAsDataURL(file);
            }
          }
        } else if (isImageUrl(text)) {
          insertImage(editor, text);
        } else {
          exec(command);
        }

        break;
      }

      case 'insert_image': {
        const { url } = command;
        insertImage(editor, url);
        break;
      }

      default: {
        exec(command);
        break;
      }
    }
  };

  return editor;
};

export const withRichText = editor => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'format_block') {
      const { format } = command;
      const isActive = isBlockActive(editor, format);
      const isList = LIST_TYPES.includes(format);

      for (const f of LIST_TYPES) {
        Editor.unwrapNodes(editor, { match: n => n.type === f, split: true });
      }

      Editor.setNodes(editor, {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format
      });

      if (!isActive && isList) {
        Editor.wrapNodes(editor, { type: format, children: [] });
      }
    } else {
      exec(command);
    }
  };

  return editor;
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
    mode: 'all'
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+s': 'save',
  'mod+l': 'latex',
  'mod+k': 'link',
  'mod+d': 'annotate',
  'mod+shift+i': 'insert_image'
};

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const AnnotatedText = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        style={{
          backgroundColor: 'rgb(255, 225, 104)',
          opacity: focused || selected ? '100%' : '30%'
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          alt={element.url}
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
      </div>
      {children}
    </div>
  );
};

export const Element = props => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          style={{ borderLeft: '2px solid rgba(0,0,0,.54)', paddingLeft: 10, marginLeft: 20 }}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case 'link':
      return (
        <a style={{ color: '#1255CC' }} {...attributes} href={element.url}>
          {children}
        </a>
      );
    case 'annotationn':
      return <AnnotatedText {...props} />;
    case 'image':
      return <ImageElement {...props} />;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.annotated) {
    children = (
      <div style={{ backgroundColor: 'rgb(255, 225, 104)', opacity: '30%' }}>{children}</div>
    );
  }

  return <span {...attributes}>{children}</span>;
};

export const ButtonEditor = React.forwardRef(({ className, active, reversed, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        cursor: pointer;
        color: ${reversed ? (active ? 'white' : '#aaa') : active ? 'black' : '#ccc'};
      `
    )}
  />
));

export const EditorValue = React.forwardRef(({ className, value, ...props }, ref) => {
  const textLines = value.document.nodes
    .map(node => node.text)
    .toArray()
    .join('\n');
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        className,
        css`
          margin: 30px -20px 0;
        `
      )}
    >
      <div
        className={css`
          font-size: 14px;
          padding: 5px 20px;
          color: #404040;
          border-top: 2px solid #eeeeee;
          background: #f8f8f8;
        `}
      >
        Slate's value as text
      </div>
      <div
        className={css`
          color: #404040;
          font: 12px monospace;
          white-space: pre-wrap;
          padding: 10px 20px;
          div {
            margin: 0 0 0.5em;
          }
        `}
      >
        {textLines}
      </div>
    </div>
  );
});
export const Icon = React.forwardRef(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      'material-icons',
      className,
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
    )}
  />
));
export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        white-space: pre-wrap;
        margin: 0 -20px 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #f8f8e8;
      `
    )}
  />
));
export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }
        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));
export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        position: relative;
        padding: 1px 0px 10px;
        margin: 0px;
        border-bottom: 2px solid #eee;
        margin-bottom: 20px;
      `
    )}
  />
));
