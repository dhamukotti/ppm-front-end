import React from 'react'

import dynamic from 'next/dynamic'

import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File
import type { SunEditorReactProps } from 'suneditor-react/dist/types/SunEditorReactProps'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

interface HtmlEditorProps extends SunEditorReactProps {
  placeholder: string
  height?: string
  onChange: (v: string) => Promise<void>
  setContent: string
  defaultValue: string
}

const HtmlEditor = ({ placeholder, height, onChange, setContent, defaultValue, ...props }: HtmlEditorProps) => {
  return (
    <SunEditor
      defaultValue={defaultValue}
      setContents={setContent}
      height={height ?? '300'}
      placeholder={placeholder ?? 'Please enter a project description....'}
      onChange={onChange}
      setOptions={{
        fontSize: [18],
        buttonList: [
          [
            'undo',
            'redo',
            'font',
            'fontSize',
            'formatBlock',
            'bold',
            'underline',
            'italic',
            'strike',
            'fontColor',
            'hiliteColor',
            'removeFormat',
            'align',
            'horizontalRule',
            'list',
            'table',
            'link',
            'image'
          ]
        ]
      }}
      {...props}
    />
  )
}

export default HtmlEditor
