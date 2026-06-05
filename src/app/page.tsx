import WeatherDashboard from '../components/WeatherDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent font-sans flex flex-col justify-center">
      <WeatherDashboard />
    </div>
  );
}
