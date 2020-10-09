import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import queryString from "query-string";
import style from './css/Movies/movieinfo.module.css'


class MovieInfoPage extends React.Component {
  constructor(props){
  		super(props);
  		props.updateLoggedIn("admin", true);
      this.state = {
          id: 57557,
          rating: 4.5
      }
      this.generateRatingStars = this.generateRatingStars.bind(this);
	}


  /*
      This function is used to generate the stars and set the appropriate ones to being colored or not
      based off of the rating passed in by the props to the state
  */
  generateRatingStars()
  {
      let stars = [];
      let tempId = "star5" + this.state.id;
      if(this.state.rating == 5.0)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form} checked={true}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
      }
      tempId = "star4half" + this.state.id;
      if(this.state.rating == 4.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
      }
      tempId = "star4" + this.state.id;
      if(this.state.rating == 4.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
      }
      tempId = "star3half" + this.state.id;
      if(this.state.rating == 3.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
      }
      tempId = "star3" + this.state.id;
      if(this.state.rating == 3.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
      }
      tempId = "star2half" + this.state.id;
      if(this.state.rating == 2.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
      }
      tempId = "star2" + this.state.id;
      if(this.state.rating == 2.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
      }
      tempId = "star1half" + this.state.id;
      if(this.state.rating == 1.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
      }
      tempId = "star1half" + this.state.id;
      if(this.state.rating == 1.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
      }
      tempId = "starhalf" + this.state.id;
      if(this.state.rating == 0.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
      }
      return stars;
  }

	render() {
		console.log(queryString.parse(this.props.location.search));
    //<img src="https://cdn.flickeringmyth.com/wp-content/uploads/2020/07/Tenet-IMAX-1-600x326.jpg"></img>
    /*
    $239,100,000<br></br>
    writer<br></br>
    director<br></br>
    https://www.tenetfilm.com<br></br>
    */
    let stars = this.generateRatingStars();
		return (
      <div className={style.mainBodyContainer}>
          <div className={style.headerContainer}>
              <div className={style.movieImageContainer}>
                  <img className={style.moviePoster} src="https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg"/>
              </div>
              <div className={style.movieDetailsOutterContainer}>
                  <div className={style.movieDetailsContainer}>
                      <div className={style.movieTitle}>
                        Tenet
                      </div>
                      <div className={style.infoContainer}>
                          PG-13 &nbsp;&nbsp; |
                          &nbsp;&nbsp; 2 hrs 30 minutes &nbsp;&nbsp; |
                          &nbsp;&nbsp; August 22, 2020
                      </div>
                      <div className={style.ratingContainer}>
                          <fieldset className={style.rating}>
                              {stars}
                          </fieldset>
                      </div>
                      <div className={style.ratingContainer}>
                      </div>
                      <div className={style.overviewContainer}>
                          <div className={style.overviewHeader}>
                              Overview
                          </div>
                          Armed with only one word - Tenet - and fighting for the survival of the entire world,
                           the Protagonist journeys through a twilight world of international espionage on a mission
                           that will unfold in something beyond real time.
                      </div>
                      <div className={style.overviewContainer}>
                          <div className={style.overviewHeader}>
                              Genre
                          </div>
                          Action, Thriller, Science Fiction
                      </div>
                      <div className={style.overviewContainer}>
                          <div className={style.overviewHeader}>
                              Director
                          </div>
                          Christopher Nolan
                      </div>
                  </div>
              </div>
          </div>
          <div className={style.movieTrailerContainer}>
				      <iframe width="100%" height="315" src="https://www.youtube.com/embed/LdOM0x0XDMo"></iframe>
          </div>
				  <iframe width="560" height="315" src="https://www.youtube.com/embed/AZGcmvrTX9M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
		);
	}
}

export default withRouter(MovieInfoPage);
