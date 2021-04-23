import React from 'react';
import style from './css/DragDropFiles/DragDropFiles.module.css';
import Cropper from 'react-easy-crop';

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
            type: "image",
            // for cropper
            crop: {x: 0, y: 0},
            zoom: 1,
            aspect: 1,
            croppedArea: undefined,
            croppedAreaPixels: undefined,
            newImageData: undefined,
            editing: true
        };
        this.dragDropHandler = this.dragDropHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dragEnterHandler = this.dragEnterHandler.bind(this);
        this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
        this.imageValidator = this.imageValidator.bind(this);
        this.inputImageHandler = this.inputImageHandler.bind(this);
        this.previewImage = this.previewImage.bind(this);
        this.removeImage = this.removeImage.bind(this);

        // for cropper
        this.setCrop = this.setCrop.bind(this);
        this.setZoom = this.setZoom.bind(this);
        this.onCropComplete = this.onCropComplete.bind(this);
        this.createImage = this.createImage.bind(this);
        this.getCroppedImg = this.getCroppedImg.bind(this);
        this.doneEditing = this.doneEditing.bind(this);
        this.editImage = this.editImage.bind(this);
    }

    // function called by Cropper to set crop
    setCrop(state) {
        this.setState({crop: state});
    }

    // function called by Cropper to set zoom
    setZoom(state) {
        this.setState({zoom: state});
    }

    // function called when user done editing picture
    async doneEditing() {
        let result = await this.getCroppedImg(this.state.imageData, this.state.croppedAreaPixels);
        this.setState({
            editing: false,
            newImageData: result
        });
        // set the image in the parent component
        this.props.setImage({
            image: this.state.image,
            imageData: result
        });
    }

    // called every time the user changes the picture by Cropper
    onCropComplete(croppedArea, croppedAreaPixels)
    {
        this.setState({
            croppedArea: croppedArea,
            croppedAreaPixels: croppedAreaPixels
        });
    }

    // create the image after user done editing
    createImage(url){
        return new Promise(async (resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {resolve(image)});
            image.addEventListener('error', error => reject(error));
            image.src = url;
            return image;
        });
    };

    // function to handle creating the image
    async getCroppedImg(imageSrc, pixelCrop) {
        const image = await this.createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')
        // get the max side of the image
        const maxSize = Math.max(image.width, image.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        // draw image in center and store data
        ctx.drawImage(
            image,
            maxSize / 2 - image.width * 0.5,
            maxSize / 2 - image.height * 0.5
        )
        const data = ctx.getImageData(0, 0, maxSize, maxSize)
        // set canvas width to final desired crop size - this will clear existing context
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        // paste generated image with correct offsets for x,y crop values.
        ctx.putImageData(
            data,
            Math.round(0 - maxSize / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - maxSize / 2 + image.height * 0.5 - pixelCrop.y)
        )
        // As Base64 string
        return canvas.toDataURL('image/jpeg');
    }

    // function to handle user dropping file in
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
                else if(file.size > 12288000)
                {
                    error = "Max image size is 12MB";
                }
                else if(file.name.length > 100)
                {
                    error = "File name cannot be greater than 100 characters";
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
                this.setState({
                    imageData: reader.result,
                    editing: true
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

    // function called when edit picture button clicked
    editImage()
    {
        this.setState({
            editing: true
        });
        // clear the image in the parent component
        this.props.setImage({
            image: undefined,
            imageData: undefined
        });
    }

    // function called when remove image button clicked
    removeImage()
    {
        this.setState({
            image: undefined,
            imageData: undefined,
            crop: {x: 0, y: 0},
            zoom: 1,
            aspect: 1,
            croppedArea: undefined,
            croppedAreaPixels: undefined,
            newImageData: undefined,
            editing: true
        });
        this.props.removeImage();
    }

    previewImage()
    {
        return (
            <React.Fragment>
            <div className={style.previewContainer}>
                <div className={style.imageContainer}>
                    <i class={`fas fa-times-circle ${style.cancelIcon} ${style.cancelFileIcon}`} onClick={this.removeImage}></i>
                    <i class={`far fa-edit ${style.editIcon}`} onClick={this.editImage}></i>
                    <img className={style.image} src={this.state.newImageData} />
                </div>
            </div>
            </React.Fragment>
        );
    }

    generateEditImage()
    {
        return (
            <React.Fragment>
            <div className={style.previewContainer}>
                <div className={style.editContainer}>
                    <i class={`fas fa-times-circle ${style.cancelIcon} ${style.cancelEditIcon}`} onClick={this.removeImage}></i>
                    <Cropper
                        image={this.state.imageData}
                        crop={this.state.crop}
                        zoom={this.state.zoom}
                        aspect={this.state.aspect}
                        onCropChange={this.setCrop}
                        onCropComplete={this.onCropComplete}
                        onZoomChange={this.setZoom}
                    />
                </div>
                <div>
                    <button
                        value="update_picture"
                        className={`submitButton ${style.submitEditButton}`}
                        onClick={this.doneEditing}
                    >Done Editing
                    </button>
                </div>
            </div>
            </React.Fragment>
        );
    }

    render() {
        let img = "";
        if(this.state.imageData !== undefined)
        {
            if(!this.state.editing)
            {
                return this.previewImage();
            }
            else
            {
                return this.generateEditImage();
            }
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
