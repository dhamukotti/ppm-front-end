export interface TFileUploadMenuItems {
  title: string
  type: string
  icon: string
  prefix: string
  hasBottomBorder: boolean
  inputTitle?: string
  inputPlaceholder?: string
  regex?: RegExp[]
}

export const menuItems: TFileUploadMenuItems[] = [
  {
    title: 'Computer',
    type: 'computer',
    icon: 'lsicon:computer-outline',
    prefix: '',
    hasBottomBorder: true
  },
  {
    title: 'Form Link',
    type: 'link',
    inputTitle: 'form',
    inputPlaceholder: 'eg. forms.google.com/....',
    
    icon: 'mdi:link-edit',
    prefix: '',
    hasBottomBorder: true
  },
  {
    title: 'Google Drive',
    type: 'link',
    inputTitle: 'google drive',
    inputPlaceholder: 'eg. drive.google.com/....',
    regex: [/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/(view|edit)(\?usp=[a-zA-Z0-9_-]+)?$/],
    icon: 'hugeicons:google-drive',
    prefix: 'drive.google',
    hasBottomBorder: false
  },
  {
    title: 'One Drive',
    type: 'link',
    inputTitle: 'one drive',
    inputPlaceholder: 'eg. onedrive.live.com/....',
    regex: [
      /^https:\/\/onedrive\.live\.com\/\?cid=[a-zA-Z0-9]+&resid=[a-zA-Z0-9]+&authkey=[a-zA-Z0-9]+$/,
      /^https:\/\/1drv\.ms\/[a-zA-Z0-9]+\/[a-zA-Z0-9_-]+\?e=[a-zA-Z0-9]+$/
    ],

    icon: 'tabler:brand-onedrive',
    prefix: '',
    hasBottomBorder: false
  },
  {
    title: 'Share point',
    type: 'link',
    inputTitle: 'share point',
    inputPlaceholder: 'eg. yourcompanyname.sharepoint.com/....',
    regex: [
      /^https:\/\/[a-zA-Z0-9]+\.sharepoint\.com\/:u:\/r\/sites\/[a-zA-Z0-9_]+\/Shared%20Documents\/[a-zA-Z0-9%\/._-]+\?csf=1&web=1&e=[a-zA-Z0-9]+$/,
      /^https:\/\/[a-zA-Z0-9]+\.sharepoint\.com\/:f:\/r\/Shared%20Documents\/[a-zA-Z0-9%\/._-]+\?e=[a-zA-Z0-9]+$/
    ],
    icon: 'mdi:microsoft-sharepoint',
    prefix: '',
    hasBottomBorder: false
  }
]
