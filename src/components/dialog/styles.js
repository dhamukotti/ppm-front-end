export const dialogMainContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'center',
  px: 6
}

export const mainTitleText = {
  fontSize: '1.4rem',
  fontWeight: 500,
  textTransform: 'capitalize',
  textAlign: 'center',
  wordBreak: 'break-word'
}

export const subTitleText = {
  color: 'rgba(80,80,80,1)',
  letterSpacing: '0.03rem'
}

export const subDescriptionText = { wordBreak: 'break-all' }

export const buttonsContainer = {
  paddingTop: 3,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 3
}

export const closeButtonIcon = { top: 8, right: 10, position: 'absolute', color: 'grey.500' }

export const makeStylesObject = {
  dialog: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: 0
  },
  dialogHiddenDrawer: {
    position: 'absolute',
    left: '46%',
    transform: 'translateX(-50%)',
    top: 0
  }
}

export const toastMainDiv = () => ({
  padding: 5,
  borderRadius: 0.5,
  width: '100%',
  display: 'flex',
  alignItems: 'start'
})
