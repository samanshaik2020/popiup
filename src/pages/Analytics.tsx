import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAnalytics, getShortLinks } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, BarChart3, PieChart, Smartphone, Globe, MousePointerClick, Filter, Download, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend } from "recharts";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = () => {
    const [searchParams] = useSearchParams();
    const linkIdParam = searchParams.get("linkId");
    const navigate = useNavigate();
    const { user } = useAuth();

    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLinkId, setSelectedLinkId] = useState<string>(linkIdParam || "all");
    const [dateRange, setDateRange] = useState("30"); // days

    useEffect(() => {
        if (linkIdParam) {
            setSelectedLinkId(linkIdParam);
        }
    }, [linkIdParam]);

    const fetchData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const [analytics, shortLinks] = await Promise.all([
                getAnalytics(user.id),
                getShortLinks(user.id)
            ]);

            setAnalyticsData(analytics || []);
            setLinks(shortLinks || []);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Filter data based on selection
    const filteredData = useMemo(() => {
        let data = analyticsData;

        // Filter by Link ID
        if (selectedLinkId !== "all") {
            data = data.filter(item => item.short_link_id === selectedLinkId);
        }

        // Filter by Date Range
        const cutoffDate = subDays(new Date(), parseInt(dateRange));
        data = data.filter(item => new Date(item.created_at) >= cutoffDate);

        return data;
    }, [analyticsData, selectedLinkId, dateRange]);

    // Aggregate Data for Charts
    const chartData = useMemo(() => {
        // 1. Clicks Over Time
        const days = eachDayOfInterval({
            start: subDays(new Date(), parseInt(dateRange) - 1),
            end: new Date()
        });

        const clicksOverTime = days.map(day => {
            const count = filteredData.filter(item => isSameDay(parseISO(item.created_at), day)).length;
            return {
                date: format(day, "MMM dd"),
                clicks: count
            };
        });

        // 2. Device Stats
        const deviceCounts: Record<string, number> = {};
        filteredData.forEach(item => {
            const device = item.device || "Unknown";
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });
        const deviceStats = Object.entries(deviceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 3. Browser Stats
        const browserCounts: Record<string, number> = {};
        filteredData.forEach(item => {
            const browser = item.browser || "Unknown";
            // Simple normalization
            let browserName = browser;
            if (browser.includes("Chrome")) browserName = "Chrome";
            else if (browser.includes("Firefox")) browserName = "Firefox";
            else if (browser.includes("Safari")) browserName = "Safari";
            else if (browser.includes("Edge")) browserName = "Edge";

            browserCounts[browserName] = (browserCounts[browserName] || 0) + 1;
        });
        const browserStats = Object.entries(browserCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 4. Top Locations (City/Country)
        const locationCounts: Record<string, number> = {};
        filteredData.forEach(item => {
            const location = item.city ? `${item.city}, ${item.country}` : (item.country || "Unknown");
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        });
        const locationStats = Object.entries(locationCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { clicksOverTime, deviceStats, browserStats, locationStats };
    }, [filteredData, dateRange]);

    const totalClicks = filteredData.length;
    const uniqueVisitors = new Set(filteredData.map(item => item.visitor_id)).size;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="-ml-2">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-500">Track performance and engagement across your links</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
                            <SelectTrigger className="w-[200px] bg-white">
                                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                <SelectValue placeholder="Filter by Link" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Links</SelectItem>
                                {links.map(link => (
                                    <SelectItem key={link.id} value={link.id}>
                                        {link.title || link.slug}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={fetchData} title="Refresh Data">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-purple-100 font-medium">Total Clicks</p>
                                    <h3 className="text-4xl font-bold mt-2">{totalClicks}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <MousePointerClick className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-purple-100 mt-4 flex items-center">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">
                                    {dateRange} days
                                </span>
                                Period total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium">Unique Visitors</p>
                                    <h3 className="text-4xl font-bold mt-2 text-gray-900">{uniqueVisitors}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Globe className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                Est. unique people
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium">Conversion Rate</p>
                                    <h3 className="text-4xl font-bold mt-2 text-gray-900">
                                        {totalClicks > 0 ? ((uniqueVisitors / totalClicks) * 100).toFixed(1) : 0}%
                                    </h3>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                Unique / Total clicks
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart - Clicks Over Time */}
                    <Card className="lg:col-span-2 shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Clicks Over Time</CardTitle>
                            <CardDescription>Daily click performance for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.clicksOverTime}>
                                        <defs>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="clicks" stroke="#8884d8" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Device Distribution */}
                    <Card className="shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Devices</CardTitle>
                            <CardDescription>Traffic by device type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={chartData.deviceStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.deviceStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Browser Stats */}
                    <Card className="shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Top Browsers</CardTitle>
                            <CardDescription>Most used browsers by your visitors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chartData.browserStats.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(item.value / totalClicks) * 100}%`,
                                                        backgroundColor: COLORS[index % COLORS.length]
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-500 w-12 text-right">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                                {chartData.browserStats.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">No data available</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Stats */}
                    <Card className="shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Top Locations</CardTitle>
                            <CardDescription>Where your traffic is coming from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chartData.locationStats.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                                {chartData.locationStats.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">No data available</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
