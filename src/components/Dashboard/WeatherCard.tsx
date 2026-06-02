import React, {useEffect, useState} from "react";
import {
	WiDaySunny,
	WiRain,
	WiCloudy,
	WiSnow,
	WiThunderstorm,
	WiStrongWind,
	WiThermometer,
} from "react-icons/wi";
import config from "../../config";
import {
	MapPin,
	Calendar as CalendarIcon,
	Loader2,
	CloudOff,
} from "lucide-react";

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
					`${config.EVENT_MANAGEMENT_BASE_URL}/weather/city?city=${location}&date=${eventDate}`,
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
		if (lowerCondition.includes("rain"))
			return <WiRain className="w-12 h-12 text-blue-500" />;
		if (lowerCondition.includes("cloud"))
			return <WiCloudy className="w-12 h-12 text-gray-400" />;
		if (lowerCondition.includes("snow"))
			return <WiSnow className="w-12 h-12 text-blue-200" />;
		if (lowerCondition.includes("thunder"))
			return <WiThunderstorm className="w-12 h-12 text-indigo-600" />;
		return <WiDaySunny className="w-12 h-12 text-amber-500" />;
	};

	if (loading) {
		return (
			<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
				<div className="relative">
					<div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
					<Loader2 className="w-6 h-6 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
				</div>
				<p className="text-gray-900 font-black text-sm uppercase tracking-widest mt-6">
					Fetching Forecast
				</p>
			</div>
		);
	}

	if (error || !weather) {
		return (
			<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
				<div className="p-5 bg-gray-50 rounded-3xl mb-6">
					<CloudOff className="w-10 h-10 text-gray-300" />
				</div>
				<h4 className="text-gray-900 font-black text-xl mb-2">
					Forecast Unavailable
				</h4>
				<p className="text-gray-400 text-sm max-w-[240px] font-medium leading-relaxed">
					We couldn&apos;t retrieve the weather data for this specific event
					location.
				</p>
			</div>
		);
	}

	return (
		<div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
			<div className="flex items-start justify-between mb-10">
				<div className="flex items-center gap-5">
					<div className="p-4 bg-gray-50 rounded-3xl group-hover:bg-indigo-50 transition-colors duration-300">
						{getWeatherIcon(weather.current.condition)}
					</div>
					<div>
						<div className="flex items-center text-gray-900 font-black text-2xl tracking-tight mb-1">
							<MapPin className="w-5 h-5 mr-2 text-indigo-600" />
							{weather.location}
						</div>
						<p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
							{weather.current.condition}
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-2">
						{weather.current.temperature}
					</div>
					<div className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
						Live Now
					</div>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-6 mb-10">
				<div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-50 flex flex-col items-center text-center group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
					<WiThermometer className="w-8 h-8 text-indigo-600 mb-3" />
					<div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
						Range
					</div>
					<div className="text-sm font-black text-gray-900">
						{weather.maxTemperature} / {weather.minTemperature}
					</div>
				</div>

				<div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-50 flex flex-col items-center text-center group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
					<WiStrongWind className="w-8 h-8 text-indigo-600 mb-3" />
					<div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
						Wind
					</div>
					<div className="text-sm font-black text-gray-900">
						{weather.current.windSpeed}
					</div>
				</div>

				<div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-50 flex flex-col items-center text-center group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
					<WiRain className="w-8 h-8 text-indigo-600 mb-3" />
					<div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
						Rain
					</div>
					<div className="text-sm font-black text-gray-900">
						{weather.rainProbability}
					</div>
				</div>
			</div>

			<div className="flex items-center justify-center gap-3 pt-8 border-t border-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest">
				<CalendarIcon className="w-4 h-4 text-indigo-600" />
				Forecast for{" "}
				{new Date(weather.date).toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
				})}
			</div>
		</div>
	);
};

export default WeatherCard;
