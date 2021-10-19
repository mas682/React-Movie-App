const dev = {
    api: {
        url: "https://localhost:9000"
    }
};

const prod = {
    api: {
        url: undefined
    }
};


const config = process.env.REACT_APP_ENV === 'DEV' ? dev : prod;

export default config;