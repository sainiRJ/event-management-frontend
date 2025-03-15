import React, {useEffect, useState} from "react";
import DashboardCard from "../common/DashboardCard";
import {
	WiDaySunny,
	WiRain,
	WiCloudy,
	WiSnow,
	WiThunderstorm,
	WiStrongWind,
	WiThermometer,
} from "react-icons/wi";
import {Panel} from "rsuite";
import "./WeatherCard.css";

interface WeatherData {
	location: string;
	date: string;
	maxTemperature: string;
	minTemperature: string;
	rainProbability: string;
	current: {
		temperature: string;
		windSpeed: string;
		condition: string;
	};
}

interface WeatherCardProps {
	location: string;
	eventDate: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({location, eventDate}) => {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchWeather = async () => {
			try {
				const response = await fetch(
					`http://localhost:3080/api/weather/city?city=${location}&date=${eventDate}`,
				);
				const data = await response.json();

				if (!data.isSuccess) {
					throw new Error(
						data.responseBody.error || "Failed to fetch weather data",
					);
				}

				setWeather(data.responseBody.data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (location && eventDate) {
			fetchWeather();
		}
	}, [location, eventDate]);

	const getWeatherIcon = (condition: string) => {
		const lowerCondition = condition.toLowerCase();
		if (lowerCondition.includes("rain")) return <WiRain size={32} />;
		if (lowerCondition.includes("cloud")) return <WiCloudy size={32} />;
		if (lowerCondition.includes("snow")) return <WiSnow size={32} />;
		if (lowerCondition.includes("thunder")) return <WiThunderstorm size={32} />;
		return <WiDaySunny size={32} />;
	};

	if (loading) {
		return <DashboardCard title="Weather" value="Loading..." />;
	}

	if (error) {
		return <DashboardCard title="Weather" value="Weather data unavailable" />;
	}

	return (
		<Panel className="weather-card" bordered>
			<div className="weather-header">
				<div className="weather-icon">
					{weather && getWeatherIcon(weather.current.condition)}
				</div>
				<div className="weather-info">
					<h3>{weather?.location}</h3>
					<p className="condition">{weather?.current.condition}</p>
				</div>
			</div>

			<div className="weather-details">
				<div className="weather-detail-item">
					<WiThermometer size={24} />
					<div>
						<p className="label">Temperature</p>
						<p className="value">{weather?.current.temperature}</p>
						<p className="sub-value">
							H: {weather?.maxTemperature} L: {weather?.minTemperature}
						</p>
					</div>
				</div>

				<div className="weather-detail-item">
					<WiStrongWind size={24} />
					<div>
						<p className="label">Wind Speed</p>
						<p className="value">{weather?.current.windSpeed}</p>
					</div>
				</div>

				<div className="weather-detail-item">
					<WiRain size={24} />
					<div>
						<p className="label">Rain Probability</p>
						<p className="value">{weather?.rainProbability}</p>
					</div>
				</div>
			</div>

			<div className="weather-footer">
				<p>
					Forecast for: {new Date(weather?.date || "").toLocaleDateString()}
				</p>
			</div>
		</Panel>
	);
};

export default WeatherCard;
