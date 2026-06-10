import { useEffect, useState } from 'react'

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
    )
}

export default function MobileOnly({ children }) {
    const [isMobile, setIsMobile] = useState(null)

    useEffect(() => {
        setIsMobile(isMobileDevice())
    }, [])

    if (isMobile === null) return null

    if (!isMobile) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
                <div className="max-w-sm w-full text-center">
                    <div className="text-6xl mb-6">📱</div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">LastRep</h1>
                    <p className="text-gray-600 text-sm mb-8">by chrkk</p>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                        <h2 className="text-white font-semibold text-lg mb-2">
                            Built for the gym floor
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            LastRep is designed for your phone. Open it on your iPhone or
                            Android device to start tracking your workouts.
                        </p>
                    </div>
                    <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                            <span className="text-orange-500 font-bold text-sm mt-0.5">1</span>
                            <div>
                                <p className="text-white text-sm font-medium">Open on your phone</p>
                                <p className="text-gray-500 text-xs mt-0.5">Visit this URL on your iPhone or Android browser</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                            <span className="text-orange-500 font-bold text-sm mt-0.5">2</span>
                            <div>
                                <p className="text-white text-sm font-medium">Add to Home Screen</p>
                                <p className="text-gray-500 text-xs mt-0.5">iPhone: Share → Add to Home Screen</p>
                                <p className="text-gray-500 text-xs">Android: Menu → Add to Home Screen</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                            <span className="text-orange-500 font-bold text-sm mt-0.5">3</span>
                            <div>
                                <p className="text-white text-sm font-medium">Use it like an app</p>
                                <p className="text-gray-500 text-xs mt-0.5">Full screen, no browser bar — feels native</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs mt-8">
                        Know what you did last time. Lift better today.
                    </p>
                </div>
            </div>
        )
    }

    return children
}