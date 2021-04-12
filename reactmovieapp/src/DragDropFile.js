import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import style from './css/DragDropFiles/DragDropFiles.module.css';
import Alert from './Alert.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class DragDropFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: 0,
            error: "",
            file: undefined,
            imageData: undefined,
            type: "image"
        };
        this.dragDropHandler = this.dragDropHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dragEnterHandler = this.dragEnterHandler.bind(this);
        this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
        this.imageValidator = this.imageValidator.bind(this);
        this.inputImageHandler = this.inputImageHandler.bind(this);
    }

    dragEnterHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        let counter = this.state.counter + 1;
        this.setState({counter: counter});
        if(counter === 1)
        {
            let form = document.querySelector('.' + style.box);
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
            let form = document.querySelector('.' + style.box);
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
            let reader = new FileReader();
            reader.readAsDataURL(result.image);
            reader.onloadend = () => {
                this.setState({imageData: reader.result});
            }
            this.setState({
                file: result.file
            });
        }
        else
        {
            this.setState({
                error: result.error
            });
        }
    }

    render() {
        let img = "";
        if(this.state.imageData !== undefined)
        {
            img = <img src={this.state.imageData} />;
        }
        return (
            <form
                className={style.box}
                method="post"
                action=""
                enctype="multipart/form-data"
                onDrop={(e) => {this.dragDropHandler(e, this.state.type)}}
                onDragOver={this.dragOverHandler}
                onDragEnter={this.dragEnterHandler}
                onDragLeave={this.dragLeaveHandler}
                id={"form"}
            >
                <div class={style.box__input}>
                    <input
                        class={style.box__file}
                        type="file"
                        accept = "image/*"
                        onChange={(e) => {this.inputImageHandler(e, "input")}}
                        name="files[]"
                        id="file"
                    />
                    <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
                </div>
                {img}
                <div class={style.box__uploading}>Uploading…</div>
                <div class={style.box__success}>Done!</div>
                <div class={style.box__error}>Error! <span></span>.</div>
            </form>
        );
    }
}


export default DragDropFile;
