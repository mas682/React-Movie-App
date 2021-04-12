import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import style from './css/DragDropFiles/DragDropFiles.module.css';
import Alert from './Alert.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class DragDropFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.dragDropHandler = this.dragDropHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dragEnterHandler = this.dragEnterHandler.bind(this);
        this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
    }

    dragDropHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        let droppedFiles = e.originalEvent.dataTransfer.files;
        console.log(droppedFiles);
    }

    dragOverHandler(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dragEnterHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        let form = document.querySelector('.' + style.box);
        form.classList.add(style.dragover);
        console.log(form);
    }

    dragLeaveHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Leave");
        let form = document.querySelector('.' + style.box);
        form.classList.remove(style.dragover);
        console.log(form);
    }

    render() {
        return (
            <form
                className={style.box}
                method="post"
                action=""
                enctype="multipart/form-data"
                onDrop={this.dragDropHandler}
                onDragOver={this.dragOverHandler}
                onDragEnter={this.dragEnterHandler}
                onDragLeave={this.dragLeaveHandler}
            >
                <div class={style.box__input}>
                    <input class={style.box__file} type="file" name="files[]" id="file" data-multiple-caption="{count} files selected" multiple />
                    <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
                </div>
                <div class={style.box__uploading}>Uploading…</div>
                <div class={style.box__success}>Done!</div>
                <div class={style.box__error}>Error! <span></span>.</div>
            </form>
        );
    }
}


export default DragDropFile;
