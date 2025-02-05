# Product Requirements Document (PRD)

## Overview

The app simplifies **CSV file transformations**, providing a user-friendly interface to **map, transform, and export CSV data**. It is designed specifically for **Winfakt users** who need to import data from **external CSV, Excel, or Winfakt Classic (\*.soc) database files** into **Winfakt Online**.

Since **Winfakt Online** only accepts CSV files with a specific column structure, this tool ensures users can effortlessly **convert and format** their data into the required proprietary CSV format. This streamlines the import process, making it easy to integrate external data sources into Winfakt Online.

## Goals & Objectives

1. **Simplify CSV File Transformations**
   - Provide a user-friendly tool to map, transform, and export CSV data.
2. **Ensure Seamless Import to Winfakt Online**
   - Generate **Winfakt-compatible CSV files** that meet the Winfakt online column format.
3. **Support Multiple Data Sources**
   - Enable users to import from **CSV, Excel, and Winfakt Classic (\*.soc) databases**.
4. **Improve Data Accuracy & Consistency**
   - Minimize formatting errors and **reduce manual work** when preparing files for import.
5. **Enhance User Efficiency**
   - Streamline the data transformation process with **intuitive mapping** and **automated conversions**.

## User Stories

1. **Winfakt Classic User**: As a Winfakt Classic user, I want to easily transform my external CSV, Excel, or Winfakt Classic (*.soc) data into a Winfakt-compatible format, so I can import it without errors.
2. **Excel User**: As a business user working with Excel files, I want to transform my spreadsheets into Winfakt Online's CSV format, so I can import my existing data without manual reformatting.
3. **Data Manager**: As a data manager, I want to save and reuse my column mappings, so I can consistently import multiple files into Winfakt online using the same transformation rules.
4. **Business Administrator**: As a business administrator, I want to ensure my CSV files meet Winfakt Online's requirements before import, so I can avoid data import errors and formatting issues.

## Features

1. **Multi-Format Import**

   - Support for CSV, Excel, and Winfakt Classic (*.soc) files
   - Automatic file format detection and validation
   - Preview of source data before transformation
2. **Winfakt-Specific Column Mapping**

   - Visual interface for mapping source columns to Winfakt Online format
   - Smart column name matching suggestions
3. **Data Validation & Transformation**

   - Real-time validation against Winfakt Online requirements
   - Automatic data format corrections (dates, numbers, etc.)
   - Error highlighting and resolution suggestions
4. **Configuration Management**

   - Save and name mapping configurations for reuse
   - Share configurations between team members
   - Import/export of mapping settings
5. **Export & Preview**

   - Generate Winfakt-compatible CSV files
   - Detailed export summary with transformation statistics

## Technical Considerations

1. **File Processing**

   - Support for large CSV and Excel files (>100MB)
   - Efficient parsing of Winfakt Classic (*.soc) database files
2. **Settings Sharing**

   - Local browser storage for configuration settings
   - Secure sharing of mapping configurations in the cloud
3. **Performance**

   - Real-time column mapping and validation
   - Efficient memory management for large datasets
   - Background processing for data transformations
4. **Compatibility**

   - Cross-browser support (Chrome, Firefox, Safari, Edge)
   - Responsive design for desktop use
5. **Development**

   - React-based single-page application
   - TypeScript for type safety
   - Modern build tooling (Vite, npm)

## Edge Cases

1. **Data Format Variations**

   - Source files with missing required Winfakt columns
   - Inconsistent date formats across different Excel files
   - Special characters in Winfakt Classic exports
   - Duplicate column names in source files
2. **Performance Boundaries**

   - Excel files larger than 100MB
   - CSV files with over 100,000 rows
   - Memory limitations in browser
   - Network timeouts during configuration sharing
3. **Data Validation**

   - Invalid data types for Winfakt fields
   - Required fields containing empty values
   - Numbers formatted as text in Excel
   - Decimal separator inconsistencies
4. **Configuration Conflicts**

   - Multiple users editing same shared configuration
   - Incompatible saved mappings after source format changes
   - Failed cloud synchronization of settings

## Success Metrics

1. **Data Processing Success**

   - Percentage of successful imports into Winfakt Online
   - Number of files successfully transformed
   - Reduction in manual data formatting time
   - Volume of data processed (rows/columns)
2. **Performance Metrics**

   - Average transformation time for different file sizes
   - Browser memory usage during large file processing
   - Configuration sharing response times
   - Time saved compared to manual formatting
3. **User Adoption**

   - Number of saved mapping configurations
   - Frequency of configuration reuse
   - Number of shared configurations
   - User retention rate
4. **Error Prevention**

   - Reduction in Winfakt import errors
   - Percentage of automatic format corrections
   - Number of validation issues caught pre-export
