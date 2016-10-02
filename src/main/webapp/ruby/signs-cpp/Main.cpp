#include <xercesc/parsers/SAXParser.hpp>
#include <xercesc/sax/HandlerBase.hpp>
#include <xercesc/util/XMLString.hpp>
#include <iostream>

using namespace std;
using namespace xercesc;

#include "Handler.h"

#include "Database.h"

const char * getText(VmsRecord * record) {
	return record->text[0];
}

int main(int argc, char* args[]) {

	try {
		XMLPlatformUtils::Initialize();
	} catch (const XMLException& toCatch) {
		char* message = XMLString::transcode(toCatch.getMessage());
		cout << "Error during initialization :\n" << message << "\n";
		XMLString::release(&message);
		return 1;
	}

	char* xmlFile = args[1];
	cout << "Reading " << xmlFile << "\n";

	SAXParser *parser = new SAXParser();
	//  parser->setDoValidation(true);
	parser->setDoNamespaces(true);    // optional

	Handler* docHandler = new Handler();
	ErrorHandler* errHandler = (ErrorHandler*) docHandler;
	parser->setDocumentHandler(docHandler);
	parser->setErrorHandler(errHandler);

	try {
		parser->parse(xmlFile);
	} catch (const XMLException& toCatch) {
		char* message = XMLString::transcode(toCatch.getMessage());
		cout << "Exception message is: \n" << message << "\n";
		XMLString::release(&message);
		return -1;
	} catch (const SAXParseException& toCatch) {
		char* message = XMLString::transcode(toCatch.getMessage());
		cout << "Exception message is: \n" << message << "\n";
		XMLString::release(&message);
		return -1;
	} catch (...) {
		cout << "Unexpected Exception \n";
		return -1;
	}

	Database * db = new Database();
//	db->debug(docHandler->getValues());

	db->update(docHandler->getValues());
	if (db->toJsonAge() > 60) {
		db->toJson();
	}

	return 0;
}

