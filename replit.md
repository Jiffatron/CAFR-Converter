# CAFR Document Processor

## Overview

This is a full-stack web application that processes CAFR (Comprehensive Annual Financial Report) PDF documents and extracts municipal financial data into CSV format. The application uses modern web technologies including React, TypeScript, Express.js, and PostgreSQL with advanced document processing capabilities including OCR and AI-powered data extraction.

## Recent Changes (July 2025)

✓ Restructured project for workspace configuration with client/server separation
✓ Fixed PDF parsing import issues using dynamic imports
✓ Fixed TypeScript compilation errors in storage layer
✓ Updated to use simpler Tailwind CSS + DaisyUI setup instead of shadcn/ui
✓ Created workspace package.json configuration for concurrent development
✓ Implemented proper error handling for file uploads and processing
✓ Updated server utility files with proper return structures (parsePdf, ocr, extractMuni)
✓ Added papaparse CSV conversion with toCsv utility
✓ Created dedicated upload route with Supabase integration for CSV storage
✓ Implemented professional blue UI theme with gradient backgrounds and color-coded status
✓ Added Stripe paywall system with $5 per PDF processing
✓ Created ProcessingSteps component with timeline and ResultCard for CSV download
✓ Implemented payment verification and session management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **File Processing**: Multer for file uploads with PDF validation
- **Document Processing Pipeline**: Multi-step async processing with status tracking

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage fallback for development

## Key Components

### Document Processing Pipeline
1. **File Upload**: PDF validation and temporary storage
2. **PDF Text Extraction**: Using pdf-parse library for initial text extraction
3. **OCR Processing**: Tesseract.js for handling scanned documents
4. **AI Data Extraction**: OpenAI integration for intelligent data parsing
5. **CSV Generation**: Structured output generation

### Authentication System
- Basic user management schema prepared
- Email and username-based authentication structure
- Session management ready for implementation

### File Management
- Secure file upload with size limits (50MB)
- PDF-only file type restrictions
- Temporary file storage with cleanup processes

### Real-time Processing Status
- Step-by-step processing tracking
- Real-time status updates via polling
- Error handling and recovery mechanisms

## Data Flow

1. **Upload Flow**: User uploads PDF → File validation → Temporary storage → Processing initiation
2. **Processing Flow**: PDF parsing → OCR (if needed) → AI extraction → Data structuring → CSV generation
3. **Status Flow**: Processing steps tracked in database → Real-time updates via API polling → UI status display
4. **Download Flow**: Completed processing → CSV file generation → Download endpoint exposure

## External Dependencies

### Core Processing Services
- **OpenAI API**: For intelligent financial data extraction
- **Tesseract.js**: OCR processing for scanned documents
- **PDF-parse**: Primary PDF text extraction

### Infrastructure Services
- **Neon Database**: Serverless PostgreSQL hosting
- **File Storage**: Local file system (production-ready for cloud storage migration)

### Development Tools
- **Replit Integration**: Development environment optimization
- **Vite Plugins**: Runtime error overlays and development tools

## Deployment Strategy

### Development Environment
- Hot module replacement with Vite
- TypeScript compilation with strict mode
- Concurrent client and server development

### Production Build
- Client: Vite production build with optimizations
- Server: ESBuild bundling for Node.js deployment
- Static asset serving through Express

### Database Management
- Schema migrations via Drizzle Kit
- Environment-based configuration
- Connection pooling ready for production scaling

### Environment Configuration
- Database URL configuration
- OpenAI API key management
- Development vs production mode detection

## Notable Architectural Decisions

### Monorepo Structure
- **Problem**: Managing shared types and schemas between client and server
- **Solution**: Unified TypeScript configuration with shared schema definitions
- **Benefits**: Type safety across full stack, reduced duplication

### Processing Pipeline Design
- **Problem**: Complex document processing with multiple steps and potential failures
- **Solution**: Step-based processing with individual status tracking
- **Benefits**: Better error recovery, user visibility into progress, easier debugging

### Storage Abstraction
- **Problem**: Development flexibility and production scalability
- **Solution**: Storage interface with in-memory and database implementations
- **Benefits**: Easy testing, development without database dependency, production readiness

### Real-time Updates
- **Problem**: Long-running processing tasks need user feedback
- **Solution**: Polling-based status updates with configurable intervals
- **Benefits**: Simple implementation, reliable status delivery, no WebSocket complexity

### AI Integration Strategy
- **Problem**: Extracting structured financial data from unstructured documents
- **Solution**: OpenAI API integration with structured prompts and validation
- **Benefits**: High accuracy data extraction, handles document variations, scalable processing