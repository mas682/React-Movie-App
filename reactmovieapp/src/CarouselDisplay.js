import React, { Component } from 'react';
import style from './css/CarouselDisplay/CarouselDisplay.module.css';


class CarouselDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.items,
            itemIndex: 0,
            firstItemIndex: 0
        };

        this.generateCarouselItems = this.generateCarouselItems.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
    };

    forwardButtonHandler()
    {
        /*
        also need to add listener for screen resize to deal with
        changing movies visible
        may have to constantly adjust container size or shrink movie size with screen?
        */

        let itemContainers = document.querySelectorAll("." + style.itemContainer);
        let outterItemContainer = document.querySelector("." + style.carouselItemsContainer);
        let outterStyle = getComputedStyle(outterItemContainer);
        let outterWidth = parseFloat(outterStyle.width);
        let outterLeftMargin = parseFloat(outterStyle.marginLeft);
        outterLeftMargin = (Number.isNaN(outterLeftMargin)) ? 0 : outterLeftMargin;
        let outterRightMargin = parseFloat(style.marginRight);
        outterRightMargin = (Number.isNaN(outterRightMargin)) ? 0 : outterRightMargin;
        let outterMargin = outterLeftMargin + outterRightMargin;
        outterWidth = (outterWidth + outterMargin);
        let counter = 0;
        let widthString = "0px";
        let widthPercent = 0;
        let t = 0;
        let itemCount = 0;
        while(counter < itemContainers.length)
        {
            let itemContainer = itemContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(itemContainer);
                let width = parseFloat(style.width);
                let paddingLeft = parseFloat(style.paddingLeft);
                paddingLeft = (Number.isNaN(paddingLeft)) ? 0 : paddingLeft;
                let paddingRight = parseFloat(style.paddingRight);
                paddingRight = (Number.isNaN(paddingRight)) ? 0 : paddingRight;
                let padding = paddingLeft + paddingRight;
                let totalWidth = width + padding;
                // count of items being displayed
                itemCount = Math.floor(outterWidth/totalWidth);
                // new
                // auto adjusts itself when item count changes on next click
                let offset = 0;
                offset = itemCount - (this.state.firstItemIndex % itemCount);
                offset = offset + this.state.firstItemIndex;
                if(this.state.firstItemIndex == 0)
                {
                    offset = itemCount;
                }
                widthPercent = (-100 * offset);
                // new ^^^
                //widthPercent = (-100 * itemCount) * (this.state.itemIndex + 1);
                widthPercent = widthPercent + "%";
                console.log("WidthPercent: " + widthPercent);
            }
            itemContainer.style.transform = "translate3d(" + widthPercent + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({
            itemIndex: this.state.itemIndex + 1,
            firstItemIndex: this.state.firstItemIndex + itemCount
        });
    }

    backwardButtonHandler()
    {
        let itemContainers = document.querySelectorAll("." + style.itemContainer);
        let outterItemContainer = document.querySelector("." + style.carouselItemsContainer);
        let outterStyle = getComputedStyle(outterItemContainer);
        let outterWidth = parseFloat(outterStyle.width);
        let outterLeftMargin = parseFloat(outterStyle.marginLeft);
        outterLeftMargin = (Number.isNaN(outterLeftMargin)) ? 0 : outterLeftMargin;
        let outterRightMargin = parseFloat(style.marginRight);
        outterRightMargin = (Number.isNaN(outterRightMargin)) ? 0 : outterRightMargin;
        let outterMargin = outterLeftMargin + outterRightMargin;
        outterWidth = (outterWidth + outterMargin);
        let counter = 0;
        let widthString = "0px";
        while(counter < itemContainers.length)
        {
            let itemContainer = itemContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(itemContainer);
                let width = parseFloat(style.width);
                let marginLeft = parseFloat(style.marginLeft);
                marginLeft = (Number.isNaN(marginLeft)) ? 0 : marginLeft;
                let marginRight = parseFloat(style.marginRight);
                marginRight = (Number.isNaN(marginRight)) ? 0 : marginRight;
                let margin = marginLeft + marginRight;
                // count of items being displayed currenlty
                let itemCount = Math.floor(outterWidth / (width + margin));
                width = (width + margin) * -(itemCount) * (this.state.itemIndex - 1);
                widthString = width + "px";
            }
            itemContainer.style.transform = "translate3d(" + "0%" + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({
            itemIndex: this.state.itemIndex - 1,
            firstItemIndex: this.state.firstItemIndex - 4
        });
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
        /*
        fix the left button to be the same as right
        then deal with more parameters beign passed in especially for style elements
        and deal with props coming in
        also fix logic for going fowards/back
        */
        let backwardButton = "";
        if(this.state.firstItemIndex > 0)
        {
            backwardButton = (
                <div className={style.backButtonContainer} onClick={this.backwardButtonHandler}>
                    <i class="fas fa-angle-right"></i>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className={style.forwardButtonContainer} onClick={this.forwardButtonHandler}>
                    <i class={`fas fa-angle-right`}></i>
                </div>
                {backwardButton}
                <div className={style.carouselItemsContainer}>
                    {items}
                </div>
            </React.Fragment>
        );
    }
}

export default CarouselDisplay;
