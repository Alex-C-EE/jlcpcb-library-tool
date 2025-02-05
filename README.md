# JLCPCB Parts Library Tool

A simple web application for browsing and filtering JLCPCB's Basic Parts Library. This tool helps electronics designers quickly find components based on various criteria like type, footprint, and specifications.

## Features

- Filter components by type, footprint, value, and voltage rating
- Sort any column in ascending or descending order
- Pagination with adjustable items per page
- Export filtered results to CSV
- Mobile-responsive design
- Real-time search and filtering
- Stock level indication

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jlcpcb-library-tool.git
cd jlcpcb-library-tool
```

2. Install dependencies:
```bash
npm install
```

3. Install required shadcn/ui components:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

- Use the filter dropdowns and search field to narrow down components
- Click column headers to sort the data
- Adjust the number of items shown per page using the dropdown
- Export your filtered results using the Export button
- Reset all filters using the Reset Filters button

## Built With

- Next.js
- React
- TypeScript
- shadcn/ui
- Papa Parse (CSV parsing)
- Tailwind CSS

## License

MIT

## Acknowledgments

- Data provided by JLCPCB's Basic Parts Library
- UI components from shadcn/ui
