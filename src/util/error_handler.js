import { Prisma } from "@prisma/client";

export function ErrorHandler(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2000':
                return (`Value too long for column: ${error.meta?.column_name}`);
                break;
            case 'P2001':
                return ("The record was not found.");
                break;
            case 'P2002':
                return (`Unique constraint violation on: ${error.meta?.target}`);
                break;
            case 'P2003':
                return (`Foreign key constraint failed on field: ${error.meta?.field_name}`);
                break;
            case 'P2004':
                return ("A constraint failed.");
                break;
            case 'P2005':
                return (`Invalid value provided for field: ${error.meta?.field_name}`);
                break;
            case 'P2006':
                return (`Invalid field type: ${error.meta?.field_name}`);
                break;
            case 'P2007':
                return ("Data validation error.");
                break;
            case 'P2008':
                return ("Failed to parse the query.");
                break;
            case 'P2009':
                return ("Failed to validate the query.");
                break;
            case 'P2010':
                return ("Raw query failed.");
                break;
            case 'P2011':
                return (`Null constraint violation on: ${error.meta?.constraint}`);
                break;
            case 'P2012':
                return ("Missing required field.");
                break;
            case 'P2013':
                return ("Missing the required argument.");
                break;
            case 'P2014':
                return ("The relation violation between records.");
                break;
            case 'P2015':
                return ("A related record could not be found.");
                break;
            case 'P2016':
                return ("Query interpretation error.");
                break;
            case 'P2017':
                return ("The records for this query are inconsistent.");
                break;
            case 'P2018':
                return ("The required connected records were not found.");
                break;
            case 'P2019':
                return ("The input value is invalid for this field.");
                break;
            case 'P2020':
                return ("Value out of range for the type.");
                break;
            case 'P2021':
                return ("The table does not exist in the database.");
                break;
            case 'P2022':
                return ("The column does not exist in the database.");
                break;
            case 'P2023':
                return ("The provided query is invalid.");
                break;
            case 'P2024':
                return ("The database operation timed out.");
                break;
            case 'P2025':
                return ("An expected record does not exist.");
                break;
            case 'P2026':
                return ("The query engine could not initialize.");
                break;
            case 'P2027':
                return ("Multiple errors occurred on the database server.");
                break;
            case 'P2028':
                return ("Transaction API error: Transaction aborted.");
                break;
            case 'P2030':
                return ("Cannot connect to the database server.");
                break;
            case 'P2031':
                return ("Database server closed the connection.");
                break;
            case 'P2033':
                return ("Prisma Client API attempted an invalid request.");
                break;
            default:
                return (`Prisma Client Known Error (code ${error.code}):  ${error.message}`);
        }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return (`Unknown Prisma Client Error: ${error.message}`);
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        return (`Prisma Client Rust Panic: ${error.message}`);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        return (`Prisma Client Initialization Error: ${error.message}`);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        return (`Prisma Client Validation Error: ${error.message}`);
    } else {
        return (`Unknown error: ${error}`);
    }
}

