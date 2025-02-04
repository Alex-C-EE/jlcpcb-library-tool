'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const JLCPCBFilter = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    type: 'All',
    footprint: 'All',
    value: '',
    voltage: 'All'
  });

  // Filter options
  const [types, setTypes] = useState(['All']);
  const [footprints, setFootprints] = useState(['All']);
  const [voltages, setVoltages] = useState(['All']);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/JLCPCB_Basic_Parts.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            
            // Extract unique values for filters
            const uniqueTypes = ['All', ...new Set(results.data.map(row => row.Type).filter(Boolean))];
            const uniqueFootprints = ['All', ...new Set(results.data.map(row => row.Footprint).filter(Boolean))];
            const uniqueVoltages = ['All', ...new Set(results.data.map(row => row['Voltage Rating']).filter(Boolean))];
            
            setTypes(uniqueTypes.sort());
            setFootprints(uniqueFootprints.sort());
            setVoltages(uniqueVoltages.sort());
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...data];
    
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
    
    setFilteredData(filtered);
  }, [data, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>JLCPCB Parts Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type:</label>
              <select 
                className="w-full p-2 border rounded"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
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
                onChange={(e) => handleFilterChange('footprint', e.target.value)}
              >
                {footprints.map(footprint => (
                  <option key={footprint} value={footprint}>{footprint}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Value contains:</label>
              <Input
                type="text"
                value={filters.value}
                onChange={(e) => handleFilterChange('value', e.target.value)}
                placeholder="Enter value..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Voltage Rating:</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.voltage}
                onChange={(e) => handleFilterChange('voltage', e.target.value)}
              >
                {voltages.map(voltage => (
                  <option key={voltage} value={voltage}>{voltage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JLCPCB Part #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Footprint</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Voltage</TableHead>
                  <TableHead>Tolerance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row['JLCPCB Part #']}</TableCell>
                    <TableCell>{row.Type}</TableCell>
                    <TableCell>{row.Footprint}</TableCell>
                    <TableCell>{row.Value}</TableCell>
                    <TableCell>{row['Voltage Rating']}</TableCell>
                    <TableCell>{row.Tolerance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JLCPCBFilter;