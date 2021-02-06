import React, { Component } from 'react';
import style from './css/CarouselDisplay/CarouselDisplay.module.css';


class CarouselDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.items,
            // index of the leftmost visible item
            firstItemIndex: 0,
            // number of items visible on screen
            itemsVisible: 0,
            // id to use for the carouselItemsContainer to differentiate when multiple on page
            id: props.id,
            itemContainerClass: props.itemContainerClass,
            // used to make windowResizeEventHandler more efficient so it doesn't do the check
            // if not close to the end of the items list
            maxVisibleItems: props.maxVisibleItems,
            itemsContainerStyle: (props.itemsContainerStyle === undefined) ? {} : props.itemsContainerStyle,
            backButtonContainerStyle: (props.backButtonContainerStyle === undefined) ? {} : props.backButtonContainerStyle,
            backButtonIconStyle: (props.backButtonIconStyle === undefined) ? {} : props.backButtonIconStyle,
            forwardButtonContainerStyle: (props.forwardButtonContainerStyle === undefined) ? {} : props.forwardButtonContainerStyle,
            forwardButtonIconStyle: (props.forwardButtonIconStyle === undefined) ? {} : props.forwardButtonIconStyle
        };
        /**** DO NOT USE MARGINS ON EITHER THE outterItemContainer or the container for the items passed in ***/
        /*** use padding! ***/


        this.directionalButtonHandler = this.directionalButtonHandler.bind(this);
        this.windowResizeEventHandler = this.windowResizeEventHandler.bind(this);
    };

    static getDerivedStateFromProps(props, prevState)
    {
        return {items: props.items};
    }

    directionalButtonHandler(type)
    {
        let outterItemContainer = document.querySelector("#" + this.state.id);
        let itemContainers = document.querySelectorAll("#" + this.state.id + " ." + this.state.itemContainerClass);
        let outterWidth = CarouselDisplay.getContainerWidth(outterItemContainer);
        let counter = 0;
        let widthPercent = 0;
        let offset = 0;
        let itemCount = 0;
        while(counter < itemContainers.length)
        {
            let itemContainer = itemContainers[counter];
            if(counter === 0)
            {
                let itemWidth = CarouselDisplay.getContainerWidth(itemContainer);
                itemCount = Math.floor(outterWidth/itemWidth);
                if(type === "back")
                {
                    let nextFirstIndex = this.state.firstItemIndex - itemCount;
                    // if the next first index is less than 0, set to 0, otherwise use nextFirstIndex
                    offset = (nextFirstIndex < 0) ? 0 : nextFirstIndex;
                }
                else
                {
                    let nextFirstIndex = this.state.firstItemIndex + itemCount;
                    let largestFirstIndex = this.state.items.length - itemCount;
                    // if the nextFirstIndex is bigger than the largest allowed firstIndex, use the largest
                    // allowed first index
                    // the largest allowed first index is the largest index where there will be no visible empty spaces shown
                    offset = (nextFirstIndex > largestFirstIndex) ? largestFirstIndex : nextFirstIndex;
                }
                widthPercent = (-100 * offset);
                widthPercent = widthPercent + "%";
            }
            itemContainer.style.transform = "translate3d(" + widthPercent + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({
            firstItemIndex: offset,
            itemsVisible: itemCount
        });
    }

    // function to get a div's width
    static getContainerWidth(element)
    {
        let style = getComputedStyle(element);
        let width = parseFloat(style.width);
        let leftPadding = parseFloat(style.paddingLeft);
        leftPadding = (Number.isNaN(leftPadding)) ? 0 : leftPadding;
        let rightPadding = parseFloat(style.paddingRight);
        rightPadding = (Number.isNaN(rightPadding)) ? 0 : rightPadding;
        let padding = leftPadding + rightPadding;
        width = (width + padding);
        return width;
    }

    windowResizeEventHandler(event)
    {

        if(this.state.items.length < 1) return;
        if(this.state.maxVisibleItems !== undefined)
        {
            // if there is no way there will be empty spaces as there are too many items left, return
            if((this.state.firstItemIndex + this.state.maxVisibleItems) < (this.state.items.length - this.state.maxVisibleItems)) return;
        }
        let itemContainers = document.querySelectorAll("#" + this.state.id + " ." + this.state.itemContainerClass);
        if(itemContainers.length < 1) return;

        // get the outter containers width
        let outterItemContainer = document.querySelector("#" + this.state.id);
        let outterWidth = CarouselDisplay.getContainerWidth(outterItemContainer);

        // get an individual items width
        let itemContainer = itemContainers[0];
        let itemWidth = CarouselDisplay.getContainerWidth(itemContainer);
        let itemCount = Math.floor(outterWidth/itemWidth);

        // may want to keep track of max visible items? to avoid all these calculations unless at end?
        if(this.state.itemsVisible !== itemCount && this.state.firstItemIndex > (this.state.items.length - itemCount))
        {
            let counter = 0;
            let widthPercent = 0;
            let offset = this.state.items.length - itemCount;
            widthPercent = (-100 * offset);
            widthPercent = widthPercent + "%";
            while(counter < itemContainers.length)
            {
                let itemContainer = itemContainers[counter];
                itemContainer.style.transform = "translate3d(" + widthPercent + ", 0px, 0px)";
                counter = counter + 1;
            }
            this.setState({
                firstItemIndex: offset,
                itemsVisible: itemCount
            });
        }
        else if(this.state.itemsVisible !== itemCount)
        {
            this.setState({
                itemsVisible: itemCount
            });
        }
    }

    componentDidMount()
    {
        window.addEventListener('resize', this.windowResizeEventHandler);
        let outterItemContainer = document.querySelector("#" + this.state.id);
        let itemContainers = document.querySelectorAll("#" + this.state.id + " ." + this.state.itemContainerClass);
        let outterWidth = CarouselDisplay.getContainerWidth(outterItemContainer);
        let itemCount = 0;
        if(itemContainers.length > 0)
        {
            let itemContainer = itemContainers[0];
            let itemWidth = CarouselDisplay.getContainerWidth(itemContainer);
            itemCount = Math.floor(outterWidth/itemWidth);
        }
        this.setState({itemsVisible: itemCount});
    }


    render ()
    {
        let items = this.state.items;
        let backwardButton = "";
        if(this.state.firstItemIndex > 0)
        {
            backwardButton = (
                <div className={style.backButtonContainer} style={this.state.backButtonContainerStyle} onClick={() =>{this.directionalButtonHandler("back")}}>
                    <i class="fas fa-angle-right" style={this.state.backButtonIconStyle}/>
                </div>
            );
        }

        let forwardButton = "";
        if(this.state.firstItemIndex < (this.state.items.length - this.state.itemsVisible) && (this.state.items.length) > this.state.itemsVisible)
        {
            forwardButton = (
                <div className={style.forwardButtonContainer} style={this.state.forwardButtonContainerStyle} onClick={() =>{this.directionalButtonHandler("forward")}}>
                    <i class={`fas fa-angle-right`} style={this.state.forwardButtonIconStyle}/>
                </div>
            )
        }

        return (
            <React.Fragment>
                {forwardButton}
                {backwardButton}
                <div className={style.carouselItemsContainer} style={this.state.itemsContainerStyle} id={this.state.id}>
                    {items}
                </div>
            </React.Fragment>
        );
    }
}

export default CarouselDisplay;
