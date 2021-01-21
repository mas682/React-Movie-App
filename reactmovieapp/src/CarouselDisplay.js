import React, { Component } from 'react';
import style from './css/CarouselDisplay/CarouselDisplay.module.css';


class CarouselDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.items,
            itemIndex: 0
        };

        this.generateCarouselItems = this.generateCarouselItems.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
    };

    forwardButtonHandler()
    {
        let movieContainers = document.querySelectorAll("." + style.itemContainer);
        let counter = 0;
        let widthString = "0px";
        while(counter < movieContainers.length)
        {
            let movieContainer = movieContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(movieContainer);
                let width = parseFloat(style.width);
                let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                width = (width + margin) * -4 * (this.state.itemIndex + 1);
                widthString = width + "px";
            }
            movieContainer.style.transform = "translate3d(" + widthString + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({itemIndex: this.state.itemIndex + 1});
    }

    backwardButtonHandler()
    {
        let movieContainers = document.querySelectorAll("." + style.itemContainer);
        let counter = 0;
        let widthString = "0px";
        while(counter < movieContainers.length)
        {
            let movieContainer = movieContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(movieContainer);
                let width = parseFloat(style.width);
                let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                width = (width + margin) * -4 * (this.state.itemIndex - 1);
                widthString = width + "px";
            }
            movieContainer.style.transform = "translate3d(" + widthString + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({itemIndex: this.state.itemIndex - 1});
    }

    generateCarouselItems()
    {
        let itemsHtml = [];
        for(let item of this.state.items)
        {
            let html = (
                <div className={style.itemContainer}>
                    {item}
                </div>
            );
            itemsHtml.push(html);
        }
        return itemsHtml;
    }


    render ()
    {
        let items = this.generateCarouselItems();
        return (
            <React.Fragment>
                <div className={style.forwardButtonContainer} onClick={this.forwardButtonHandler}>
                    <i class={`fas fa-angle-right`}></i>
                </div>
                <div className={style.backButton} onClick={this.backwardButtonHandler}>
                    <i class="fas fa-angle-right"></i>
                </div>
                <div className={style.carouselItemsContainer}>
                    {items}
                </div>
            </React.Fragment>
        );
    }
}

export default CarouselDisplay;
