import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';

// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
import { Button, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import parse from 'html-react-parser';
import PropTypes from 'prop-types';

const ConfirmModal =  (props) => {

    const {title, content, show, onAction} = props;

    return (
        <Transition appear show={show}>
            <Dialog as="div" className="relative z-10 focus:outline-none" onClose={() => {onAction(MODAL_ACTION_CLOSE)}}>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/25">
                    <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 transform-[scale(95%)]"
                        enterTo="opacity-100 transform-[scale(100%)]"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 transform-[scale(100%)]"
                        leaveTo="opacity-0 transform-[scale(95%)]"
                    >
                        <DialogPanel className="w-full max-w-2xl rounded-xl bg-list-bg-color p-6 backdrop-blur-2xl">
                            <DialogTitle as="h3" className="text-base/7 font-medium text-black">
                                {title}
                            </DialogTitle>
                            <p className="mt-2 text-sm/6 text-black">
                                {parse(content)}
                            </p>
                            <div className="mt-4">
                                <Button
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                                    onClick={() => {onAction(MODAL_ACTION_CLOSE)}}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                                    onClick={() => {onAction(MODAL_ACTION_CONFIRM)}}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>

        // <Modal show={show} onHide={() => onAction(MODAL_ACTION_CLOSE)} backdrop="static" centered>
        //     <Modal.Header closeButton>
        //         <Modal.Title>{title}</Modal.Title>
        //     </Modal.Header>
        //     <Modal.Body>{parse(content)}</Modal.Body>
        //     <Modal.Footer>
        //         <Button variant="secondary" onClick={() => onAction(MODAL_ACTION_CLOSE)}>
        //             Close
        //         </Button>
        //         <Button variant="primary" onClick={() => onAction(MODAL_ACTION_CONFIRM)}>
        //             Confirm
        //         </Button>
        //     </Modal.Footer>
        // </Modal>
    );
}

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
};

export default ConfirmModal;