import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const base = {
  imageUrl: '/sido-logo.png',
  imageWidth: 72,
  imageHeight: 58,
  imageAlt: 'SIDO logo',
  buttonsStyling: false,
  customClass: {
    popup: 'sido-alert',
    title: 'sido-alert-title',
    confirmButton: 'sido-alert-confirm',
    cancelButton: 'sido-alert-cancel',
    actions: 'sido-alert-actions',
  },
}

export async function sidoConfirm({ title, text, confirmText = 'Confirm', danger = false }) {
  const result = await Swal.fire({ ...base, title, text, icon: danger ? 'warning' : 'question', showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'Cancel', reverseButtons: true, focusCancel: danger })
  return result.isConfirmed
}

export const sidoSuccess = (title, text) => Swal.fire({ ...base, title, text, icon: 'success', confirmButtonText: 'Done' })
export const sidoError = (title, text) => Swal.fire({ ...base, title, text, icon: 'error', confirmButtonText: 'Close' })
