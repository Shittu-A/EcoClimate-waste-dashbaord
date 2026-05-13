# EcoClimate Waste Dashboard

An interactive dashboard for monitoring dumpsites in Nigeria, built with Next.js and Tailwind CSS.

## Features
- **Interactive Map**: Visualize dumpsite locations across Nigeria.
- **Dynamic Filtering**: Filter sites by State, Type, and Category.
- **Statistical Overview**: Real-time stats cards and breakdown charts.
- **Data-Driven**: Powered by GeoJSON data.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [React-Leaflet](https://react-leaflet.js.org/)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data
The dashboard uses a GeoJSON file located at `public/nigeria_dumpsites.geojson`.
