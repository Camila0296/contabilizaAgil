import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function showSuccess(message: string) {
  MySwal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    timer: 1800,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

export function showError(message: string) {
  MySwal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    timer: 2200,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}