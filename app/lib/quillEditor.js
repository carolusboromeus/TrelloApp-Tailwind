'use client'

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Quill from 'quill';
import PropTypes from 'prop-types';
import 'quill/dist/quill.snow.css';
// import dynamic from 'next/dynamic';

// Editor is an uncontrolled React component
const Editor = forwardRef(
  ({ defaultValue, onTextChange, placeholder, modules, readOnly}, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement('div'),
        );

        let quill = '';
        quill = new Quill(editorContainer, {
            theme: 'snow',
            modules: modules,
            placeholder: placeholder,
            readOnly: readOnly
        });

        if(ref){
          ref.current = quill;
        }

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (...args) => {
            onTextChange(quill.getContents());
        });

        return () => {
            if(ref){
              ref.current = null;
            }
            container.innerHTML = '';
          };
        // eslint-disable-next-line
    }, [ref, onTextChange, placeholder, readOnly]);

    useEffect(() => {
      const toolbar = document.getElementsByClassName("ql-toolbar");
      if(toolbar.length > 0){
        toolbar[0].style.borderTopLeftRadius = "15px";
        toolbar[0].style.borderTopRightRadius = "15px";
      }

      const editor = document.getElementsByClassName("ql-container");
      if(editor.length > 0){
        editor[0].style.borderBottomLeftRadius = "15px";
        editor[0].style.borderBottomRightRadius = "15px";
      }

      const editorDisabled = document.getElementsByClassName("ql-disabled");
      if(editorDisabled.length > 0){
        editorDisabled[0].style.borderRadius = "15px";
      }
    }, [])

    return <div ref={containerRef}></div>
  },
);

Editor.propTypes = {
  defaultValue: PropTypes.object,
  onTextChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  modules: PropTypes.object.isRequired,
  readOnly: PropTypes.bool
};

Editor.displayName = 'Editor';

export default Editor;