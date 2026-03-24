// Dashboard Homepage
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100" style={{
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(249, 115, 22, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.08) 0px, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
    }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-sm text-gray-600 mb-6">
              <i className="fas fa-sparkles text-orange-500" />
              <span>AI-Powered Agricultural Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
              <span className="text-green-600">Agri</span>
              <span className="text-orange-500">Flow</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              National intelligence platform for Sri Lanka's agricultural sector.
              Real-time data, AI-powered insights, and smart logistics.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/map"
                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-lg"
              >
                <i className="fas fa-map-marked-alt mr-2" />
                Explore Map Intelligence
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-bold rounded-xl hover:bg-white transition border border-white/60"
              >
                <i className="fas fa-store mr-2" />
                Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 transition">
            <div className="w-14 h-14 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
              <i className="fas fa-chart-pie text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Market Intelligence</h3>
            <p className="text-gray-600">
              Real-time surplus and shortage indicators across all 25 districts.
              AI-powered price trend analysis and forecasts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 transition">
            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <i className="fas fa-cloud-showers-heavy text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Climate Risk Analysis</h3>
            <p className="text-gray-600">
              Flood and drought risk monitoring with 3-month forecast horizons.
              Early warning system for climate-related disruptions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 transition">
            <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
              <i className="fas fa-truck-moving text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Logistics</h3>
            <p className="text-gray-600">
              AI-calculated transport routes from surplus to shortage regions.
              Optimize distribution across the national network.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center">
            <div className="text-4xl font-extrabold text-orange-500 mb-2">25</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Districts</div>
          </div>
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center">
            <div className="text-4xl font-extrabold text-green-500 mb-2">9</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Provinces</div>
          </div>
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center">
            <div className="text-4xl font-extrabold text-blue-500 mb-2">26</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Crop Types</div>
          </div>
          <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center">
            <div className="text-4xl font-extrabold text-purple-500 mb-2">3</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Month Forecast</div>
          </div>
        </div>
      </section>
    </div>
  );
}
