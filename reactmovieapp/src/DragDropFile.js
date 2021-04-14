import React from 'react';
import style from './css/DragDropFiles/DragDropFiles.module.css';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class DragDropFile extends React.Component {
    constructor(props) {
        super(props);
        // if one is not undefined, both should not be undefined
        let image = (this.props.image === undefined) ? undefined : this.props.image;
        let imageData = (this.props.imageData === undefined) ? undefined : this.props.imageData;
        this.state = {
            // keeps track of if user hovering over input container
            counter: 0,
            error: "",
            image: undefined,
            imageData: undefined,
            type: "image"
        };
        this.dragDropHandler = this.dragDropHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dragEnterHandler = this.dragEnterHandler.bind(this);
        this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
        this.imageValidator = this.imageValidator.bind(this);
        this.inputImageHandler = this.inputImageHandler.bind(this);
        this.previewImage = this.previewImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }

    dragEnterHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        let counter = this.state.counter + 1;
        this.setState({counter: counter});
        if(counter === 1)
        {
            let form = document.querySelector('.' + style.dropContainer);
            form.classList.add(style.dragover);
        }
    }

    dragOverHandler(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dragDropHandler(e, type) {
        e.preventDefault();
        e.stopPropagation();
        if(type === "image")
        {
            this.inputImageHandler(e, "drop");
        }
    }

    dragLeaveHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        let counter = this.state.counter - 1;
        this.setState({counter: counter});
        if(counter === 0)
        {
            let form = document.querySelector('.' + style.dropContainer);
            form.classList.remove(style.dragover);
        }
    }

    // function to validate a file is in fact a image and meets the max size requirement
    imageValidator(files)
    {
        let error = "";
        if(files.length > 1)
        {
            error = "Only 1 file can be selected";
        }
        else if(files.length < 1)
        {
            error = "You must select a file";
        }
        else
        {
            let file = files[0];
            let type = file.type.toLowerCase();
            if(!type.startsWith("image/"))
            {
                error = "Please select a valid image file";
            }
            else
            {
                let subtype = type.split('/')[1];
                if(subtype !== 'jpeg' && subtype !== 'jpg' && subtype !== 'png' && subtype !== 'bmp' && subtype !== 'gif')
                {
                    error = "Please select a valid image file"
                }
                else if(file.size > 1024000)
                {
                    error = "Max image size is 1MB";
                }
                else
                {
                    return {
                        image: file,
                        error: error
                    };
                }
            }
        }
        return {
            image: undefined,
            error: error
        };
    }

    // function to handle a new file being selected by the user
    // whether it is a drag/drop file or selected using input
    inputImageHandler(e, type)
    {
        let files = (type === "drop") ? e.dataTransfer.files : e.target.files;
        let result = this.imageValidator(files);
        if(result.error === "")
        {
            this.setState({
                image: result.image
            });
            let reader = new FileReader();
            reader.readAsDataURL(result.image);
            reader.onloadend = () => {
                this.setState({imageData: reader.result});
                this.props.setImage({
                    image: result.image,
                    imageData: reader.result
                });
            }
        }
        else
        {
            this.setState({
                error: result.error
            });
        }
    }

    removeImage()
    {
        this.setState({
            image: undefined,
            imageData: undefined
        });
    }

    previewImage()
    {
        console.log(this.state.image);
        let output = (
            <React.Fragment>
            <div className={style.previewContainer}>
                <div className={style.imageContainer}>
                    <i class={`fas fa-times-circle ${style.cancelIcon}`} onClick={this.removeImage}></i>
                    <img className={style.image} src={this.state.imageData} />
                </div>
            </div>
            </React.Fragment>
        );
        return output;
    }

    render() {
        let img = "";
        if(this.state.imageData !== undefined)
        {
            return this.previewImage();
        }
        let output = (
            <div
                className={`${style.dropContainer} ${style.outline}`}
                onDrop={(e) => {this.dragDropHandler(e, this.state.type)}}
                onDragOver={this.dragOverHandler}
                onDragEnter={this.dragEnterHandler}
                onDragLeave={this.dragLeaveHandler}
            >
                <div>
                    <input
                        class={style.imageInput}
                        type="file"
                        accept = "image/*"
                        onChange={(e) => {this.inputImageHandler(e, "input")}}
                        name="files[]"
                        id="fileInput"
                    />
                    <label for="fileInput"><strong>Choose a file</strong><span class={style.info_text}> or drag it here</span>.</label>
                </div>
            </div>
        );
        if(this.state.error !== "")
        {
            output = (
                <div
                    className={`${style.dropContainer} ${style.errorOutline}`}
                    onDrop={(e) => {this.dragDropHandler(e, this.state.type)}}
                    onDragOver={this.dragOverHandler}
                    onDragEnter={this.dragEnterHandler}
                    onDragLeave={this.dragLeaveHandler}
                >
                    <div>
                        <input
                            class={style.imageInput}
                            type="file"
                            accept = "image/*"
                            onChange={(e) => {this.inputImageHandler(e, "input")}}
                            name="files[]"
                            id="fileInput"
                        />
                        <label for="fileInput"><strong>Choose a file</strong><span class={style.info_text}> or drag it here</span>.</label>
                        <span className={style.errorText}>{this.state.error}</span>
                    </div>
                </div>
            )
        }
        return (
            <React.Fragment>
                {output}
            </React.Fragment>
        );
    }
}


export default DragDropFile;
