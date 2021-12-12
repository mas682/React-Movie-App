import React from 'react';
import style from '../css/About/About.module.css';

// function to generate the html for a error message
const getAboutDisplay = () =>
{
    return(
         <div className={style.mainBodyContainer}>
            <div className={`${style.headerContainer} ${style.marginTop10} ${style.marginBottom10}`}>
                <div className={style.header}>About</div>
            </div>
            <div className={style.infoContainer}>
                <div className={`${style.sectionHeaderContainer}`}>
                    <div className={style.sectionHeader}>Background</div>
                </div>
                <div className={`${style.sectionBody} ${style.marginTop10} ${style.marginBottom10}`}>
                    This site was created by Matt Stropkey with the purpose being to learn how to create a full scale web application from scratch.
                    The idea behind the site itself is to give a platform for users to be able to track movies and shows that they watch 
                    while also being able to share them with their friends.  The long term goal is to continue to build new features onto the site 
                    as I get time to provide a better user experience.  As the site gets more users, I am hoping I can start producing some income so 
                    that I can continue to build the site up with more servers, more show/movie data, more database space, etc.  The current state of the site 
                    is somewhat limited in that it can only be accessed through a web browser(E.g. Safari, Google Chrome, Edge, etc.). 
                </div>
                <div className={`${style.sectionHeaderContainer} ${style.marginTop10}`}>
                    <div className={style.sectionHeader}>Sign Up</div>
                </div>
                <div className={`${style.sectionBody} ${style.marginTop10} ${style.marginBottom10}`}>
                    If you plan on signing up for the site, you will need to verify your email.  I do not do anything with your email other than use it as a way to authenticate 
                    who you are.  This can also be used to reset your password if needed.
                </div>
                <div className={`${style.sectionHeaderContainer} ${style.marginTop10}`}>
                    <div className={style.sectionHeader}>Contact</div>
                </div>
                <div className={`${style.sectionBody} ${style.marginTop10} ${style.marginBottom10}`}>
                    I appreciate you taking the time to check out the site.  If you have any feedback or issues feel free to email me at help@movie-fanatics.com
                </div>
                <div className={`${style.sectionHeaderContainer} ${style.marginTop10}`}>
                    <div className={style.sectionHeader}>Data Source(s)</div>
                </div>
                <div className={`${style.sectionBody} ${style.marginTop10} ${style.marginBottom20}`}>
                    <div className={style.imageContainer}>
                        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"></img>
                    </div>
                This product uses the TMDB API but is not endorsed or certified by <a className={style.externalLink} href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
                </div>
            </div>
        </div>
    );
};

export {getAboutDisplay};