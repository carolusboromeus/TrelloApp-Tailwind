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