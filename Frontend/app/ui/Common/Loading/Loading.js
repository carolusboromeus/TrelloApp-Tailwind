// import './Loading.scss';

const Loading =  (props) => {

    return (
        <div className="absolute bottom-0 w-full sm:w-fit">
            <div className="bg-list-bg-color w-full sm:w-96 sm:m-5 p-4 sm:rounded-md rounded-t-md flex">
                <i className="bi bi-arrow-clockwise mr-3 text-sky-600"></i>
                <div className="ml-4">
                    <h6>Load Data.</h6>
                    <div>Please wait...</div>
                </div>
            </div>
        </div>
    );
}

export default Loading;