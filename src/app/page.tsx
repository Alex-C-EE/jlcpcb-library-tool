/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Download, Loader2, X } from 'lucide-react';

interface RowData {
  'JLCPCB Part #': string;
  Type: string;
  Footprint: string;
  Value: string;
  'Voltage Rating': string;
  Tolerance: string;
  Stock: string;
  [key: string]: any;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const JLCPCBFilter = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  
  const [filters, setFilters] = useState({
    type: 'All',
    footprint: 'All',
    value: '',
    voltage: 'All'
  });

  const [types, setTypes] = useState(['All']);
  const [footprints, setFootprints] = useState(['All']);
  const [voltages, setVoltages] = useState(['All']);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const basePath = process.env.NODE_ENV === 'production' ? '/jlcpcb-library-tool' : '';
        const response = await fetch(`${basePath}/JLCPCB_Basic_Parts.csv`);
        const text = await response.text();
        
        Papa.parse<string>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as unknown as RowData[];
            setData(parsedData);
        
            const uniqueTypes = ['All', ...new Set(parsedData.map(row => row.Type).filter(Boolean))];
            const uniqueFootprints = ['All', ...new Set(parsedData.map(row => row.Footprint).filter(Boolean))];
            const uniqueVoltages = ['All', ...new Set(parsedData.map(row => row['Voltage Rating']).filter(Boolean))];
        
            setTypes(uniqueTypes.sort());
            setFootprints(uniqueFootprints.sort());
            setVoltages(uniqueVoltages.sort());
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error.message);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const resetFilters = () => {
    setFilters({
      type: 'All',
      footprint: 'All',
      value: '',
      voltage: 'All'
    });
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data];
    
    // Apply filters
    if (filters.type !== 'All') {
      filtered = filtered.filter(row => row.Type === filters.type);
    }
    if (filters.footprint !== 'All') {
      filtered = filtered.filter(row => row.Footprint === filters.footprint);
    }
    if (filters.value) {
      filtered = filtered.filter(row => 
        row.Value?.toString().toLowerCase().includes(filters.value.toLowerCase())
      );
    }
    if (filters.voltage !== 'All') {
      filtered = filtered.filter(row => row['Voltage Rating'] === filters.voltage);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Special handling for Stock column to sort numerically
        if (sortConfig.key === 'Stock') {
          const aNum = parseInt(a[sortConfig.key]) || 0;
          const bNum = parseInt(b[sortConfig.key]) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        // Default string sorting for other columns
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  useEffect(() => {
    setFilteredData(sortedAndFilteredData);
    setCurrentPage(1);
  }, [sortedAndFilteredData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'filtered_parts.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const SortButton = ({ column }: { column: string }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="h-8 px-2"
    >
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>JLCPCB Parts Filter</CardTitle>
            <div className="space-x-2">
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
              >
                Reset Filters
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type:</label>
              <select 
                className="w-full p-2 border rounded"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Footprint:</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.footprint}
                onChange={(e) => setFilters(prev => ({ ...prev, footprint: e.target.value }))}
              >
                {footprints.map(footprint => (
                  <option key={footprint} value={footprint}>{footprint}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Value contains:</label>
              <div className="relative">
                <Input
                  type="text"
                  value={filters.value}
                  onChange={(e) => setFilters(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value..."
                  className="w-full pr-8"
                />
                {filters.value && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setFilters(prev => ({ ...prev, value: '' }))}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Voltage Rating:</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.voltage}
                onChange={(e) => setFilters(prev => ({ ...prev, voltage: e.target.value }))}
              >
                {voltages.map(voltage => (
                  <option key={voltage} value={voltage}>{voltage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Showing {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Items per page:</label>
              <select
                className="p-1 border rounded"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        JLCPCB Part # <SortButton column="JLCPCB Part #" />
                      </TableHead>
                      <TableHead>
                        Type <SortButton column="Type" />
                      </TableHead>
                      <TableHead>
                        Footprint <SortButton column="Footprint" />
                      </TableHead>
                      <TableHead>
                        Value <SortButton column="Value" />
                      </TableHead>
                      <TableHead>
                        Voltage <SortButton column="Voltage Rating" />
                      </TableHead>
                      <TableHead>
                        Tolerance <SortButton column="Tolerance" />
                      </TableHead>
                      <TableHead>
                        Stock <SortButton column="Stock" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((row, index) => (
                        <TableRow key={row['JLCPCB Part #'] || index}>
                          <TableCell>{row['JLCPCB Part #']}</TableCell>
                          <TableCell>{row.Type}</TableCell>
                          <TableCell>{row.Footprint}</TableCell>
                          <TableCell>{row.Value}</TableCell>
                          <TableCell>{row['Voltage Rating']}</TableCell>
                          <TableCell>{row.Tolerance}</TableCell>
                          <TableCell>{row.Stock}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JLCPCBFilter;