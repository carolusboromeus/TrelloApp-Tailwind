import PropTypes from 'prop-types';

export const modules = {
    toolbar: [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        // [
        //     { list: "ordered" },
        //     { list: "bullet" },
        //     { indent: "-1" },
        //     { indent: "+1" },   
        //     { align: [] }
        // ],
        // [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
    ]
};

export const formats = [
    "header", "height", "bold", "italic",
    "underline", "strike",
    "list", "bullet", "indent", "size",
    "link",
];

const CustomButton = () => <span className="fa fa-paperclip"/>;

export const CustomToolbar = ({toolbarId}) => (
    
    <div id={toolbarId}>
        <span className="ql-formats">
            <select
                className="ql-size"
                value={''}
                onChange={(e) => e.persist()}
            >
                <option value="small"></option>
                <option value=""></option>
                <option value="large"></option>
                <option value="huge"></option>
            </select>
        </span>
        <span className="ql-formats">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
            <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-list" value="ordered"></button>
            <button className="ql-list" value="bullet"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-link"></button>
            <button className="insertFile">
                <CustomButton />
            </button>
        </span>
    </div>
);

CustomToolbar.propTypes = {
    toolbarId: PropTypes.string.isRequired,
};