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
		return (
			<DashboardCard
				title="Weather"
				value="Loading..."
				icon={<WiDaySunny />}
				color="#722ed1"
			/>
		);
	}

	if (error) {
		return (
			<DashboardCard
				title="Weather"
				value="Weather data unavailable"
				icon={<WiCloudy />}
				color="#722ed1"
			/>
		);
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
						<p className="label">Rain Chance</p>
						<p className="value">{weather?.rainProbability}</p>
					</div>
				</div>
			</div>

			<div className="weather-footer">
				<p>
					Forecast for{" "}
					{new Date(weather?.date || "").toLocaleDateString("en-US", {
						weekday: "long",
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</p>
			</div>
		</Panel>
	);
};

export default WeatherCard;


// import React, {useEffect, useState} from "react";
// import {
//   WiDaySunny,
//   WiRain,
//   WiCloudy,
//   WiSnow,
//   WiThunderstorm,
//   WiStrongWind,
//   WiThermometer,
// } from "react-icons/wi";

// interface WeatherData {
//   location: string;
//   date: string;
//   maxTemperature: string;
//   minTemperature: string;
//   rainProbability: string;
//   current: {
//     temperature: string;
//     windSpeed: string;
//     condition: string;
//   };
// }

// interface WeatherCardProps {
//   location: string;
//   eventDate: string;
// }

// const WeatherCard: React.FC<WeatherCardProps> = ({ location, eventDate }) => {
//   const [weather, setWeather] = useState<WeatherData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3080/api/weather/city?city=${location}&date=${eventDate}`
//         );
//         const data = await response.json();

//         if (!data.isSuccess) {
//           throw new Error(
//             data.responseBody.error || "Failed to fetch weather data"
//           );
//         }

//         setWeather(data.responseBody.data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (location && eventDate) {
//       fetchWeather();
//     }
//   }, [location, eventDate]);

//   const getWeatherIcon = (condition: string) => {
//     const lowerCondition = condition.toLowerCase();
//     if (lowerCondition.includes("rain")) return <WiRain size={32} />;
//     if (lowerCondition.includes("cloud")) return <WiCloudy size={32} />;
//     if (lowerCondition.includes("snow")) return <WiSnow size={32} />;
//     if (lowerCondition.includes("thunder")) return <WiThunderstorm size={32} />;
//     return <WiDaySunny size={32} />;
//   };

//   if (loading || error || !weather) {
//     return (
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md w-full h-full flex items-center justify-center text-center text-gray-600 dark:text-gray-300">
//         {loading
//           ? "Loading weather..."
//           : "Unable to fetch weather data"}
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl shadow-lg p-6 w-full hover:shadow-xl transition-all">
//       <div className="flex items-center space-x-4 mb-6">
//         <div className="bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-white rounded-full p-4 shadow-md">
//           {getWeatherIcon(weather.current.condition)}
//         </div>
//         <div>
//           <h2 className="text-xl font-semibold">{weather.location}</h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {weather.current.condition}
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//         <div className="flex items-start space-x-3 bg-purple-50 dark:bg-purple-800/40 p-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-700 transition">
//           <WiThermometer className="text-purple-600 dark:text-white" size={24} />
//           <div>
//             <p className="text-xs uppercase text-gray-500 dark:text-gray-300 font-semibold">
//               Temperature
//             </p>
//             <p className="text-lg font-bold">{weather.current.temperature}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               H: {weather.maxTemperature} L: {weather.minTemperature}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-start space-x-3 bg-purple-50 dark:bg-purple-800/40 p-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-700 transition">
//           <WiStrongWind className="text-purple-600 dark:text-white" size={24} />
//           <div>
//             <p className="text-xs uppercase text-gray-500 dark:text-gray-300 font-semibold">
//               Wind Speed
//             </p>
//             <p className="text-lg font-bold">{weather.current.windSpeed}</p>
//           </div>
//         </div>

//         <div className="flex items-start space-x-3 bg-purple-50 dark:bg-purple-800/40 p-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-700 transition">
//           <WiRain className="text-purple-600 dark:text-white" size={24} />
//           <div>
//             <p className="text-xs uppercase text-gray-500 dark:text-gray-300 font-semibold">
//               Rain Chance
//             </p>
//             <p className="text-lg font-bold">{weather.rainProbability}</p>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-gray-200 dark:border-gray-600 pt-4 text-sm text-center text-gray-500 dark:text-gray-400">
//         Forecast for{" "}
//         {new Date(weather.date).toLocaleDateString("en-US", {
//           weekday: "long",
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         })}
//       </div>
//     </div>
//   );
// };

// export default WeatherCard;
