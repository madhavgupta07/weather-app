import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionSummary, AccordionDetails, Grid, Box, TextField, Button, Typography } from '@mui/material';
import moment from 'moment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [district, setDistrict] = useState('');
    const [data, setData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    console.log(data, "Test");

    const getLatAndLon = async () => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${district}&limit=1&appid=e8a55cd2396955ca12d8e9b4996b3845`);
            setLatitude(response.data[0].lat);
            setLongitude(response.data[0].lon);
            setError(false); // Reset error state on successful response
        } catch (error) {
            console.error(error);
            setError(true);
            showToastMessage();
        }
    };

    const getWeatherForecast = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=e8a55cd2396955ca12d8e9b4996b3845`);
            setData(response.data);
            setIsLoading(false);
            setError(false); // Reset error state on successful response
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setError(true);
            showToastMessage();
        }
    };

    function kelvinToCelsius(kelvin) {
        return kelvin - 273.15;
    }

    const showToastMessage = () => {
        toast.error("Please enter a correct district name!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };

    const handleSearch = () => {
        getLatAndLon();
    };

    const getLatestDataPerDay = (dataList) => {
        const latestData = {};

        dataList.forEach((item) => {
            const date = moment.unix(item.dt).format('YYYY-MM-DD');
            if (!latestData[date] || item.dt > latestData[date].dt) {
                latestData[date] = item;
            }
        });

        return Object.values(latestData);
    };

    useEffect(() => {
        if (latitude && longitude) {
            getWeatherForecast();
        }
    }, [latitude, longitude]);

    const filteredData = data ? getLatestDataPerDay(data.list) : [];

    return (
        <Box
            sx={{
                width: '60%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 4,
            }}
        >
            <ToastContainer />
            <Grid container direction="column" alignItems="center" spacing={2}>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="District"
                        onChange={(e) => setDistrict(e.target.value)}
                    />
                    <Button variant="contained" className='mt-2 ms-4' size="large" onClick={handleSearch}>Search</Button>
                </Grid>

                <Grid item container spacing={4} className='border mt-3'>
                    <Grid item xs={12} md={6} container direction="column" className=''>
                        <Typography variant="h5" style={{ textAlign: "center" }}>Current Weather</Typography>
                        {
                            data ?
                                <>
                                    <Typography variant="h5">{data && data.city.name}</Typography>
                                    <Typography variant="h5">{data && kelvinToCelsius(data.list[0].main.temp).toFixed(1)} °C</Typography>
                                    {data && data.list.map((item, index) => (
                                        moment.unix(item.dt).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY') &&
                                        <Fragment key={index}>
                                            <div className='d-flex gap-5'>
                                                <div className='d-flex flex-column'>
                                                    <span>Humidity</span>
                                                    <span>{item.main.humidity} %</span>
                                                </div>
                                                <div className='d-flex flex-column'>
                                                    <span>Wind Speed</span>
                                                    <span>{item.wind.speed} m/s</span>
                                                </div>
                                                <div className='d-flex flex-column'>
                                                    <span>Cloud</span>
                                                    <span>{item.clouds.all}%</span>
                                                </div>
                                            </div>
                                        </Fragment>
                                    ))}
                                </> :
                                <>
                                    {
                                        isLoading ? <Box sx={{ display: 'flex' }} className="justify-content-center align-item-center">
                                            <CircularProgress className='align-self-center' />
                                        </Box> : null
                                    }
                                </>
                        }
                    </Grid>
                    <Grid item xs={12} md={6} container direction="column" className='' >
                        <Typography style={{ textAlign: "center" }} variant="h5">Weekly Forecast</Typography>
                        {
                            data ? <>{filteredData.map((item, index) => (
                                moment.unix(item.dt).format('DD/MM/YYYY') !== moment().format('DD/MM/YYYY') && (
                                    <>
                                        <Accordion className='me-4 mb-2' key={index}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                            >
                                                <div className='d-flex gap-5'>
                                                    <div className='d-flex flex-column'>
                                                        <p>{moment.unix(item.dt).format('dddd')}</p>
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        <p>{item.weather[0].description}</p>
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        <p>{kelvinToCelsius(item.main.temp).toFixed(1)} °C</p>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container spacing={2}>

                                                    <div className='d-flex gap-5 ms-3'>
                                                        <div className='d-flex flex-column'>
                                                            <span>Humidity</span>
                                                            <span>{item.main.humidity} %</span>
                                                        </div>
                                                        <div className='d-flex flex-column'>
                                                            <span>Wind Speed</span>
                                                            <span>{item.wind.speed} m/s</span>
                                                        </div>
                                                        <div className='d-flex flex-column'>
                                                            <span>Cloud</span>
                                                            <span>{item.clouds.all}%</span>
                                                        </div>
                                                    </div>

                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    </>
                                )
                            ))}</> : <>{
                                isLoading ? <Box sx={{ display: 'flex' }} className="justify-content-center align-item-center">
                                    <CircularProgress className='align-self-center' />
                                </Box> : null
                            }</>
                        }

                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default App;
