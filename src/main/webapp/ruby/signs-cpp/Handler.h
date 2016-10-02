/*
 * Handler.h
 *
 *  Created on: 21 Feb 2016
 *      Author: adam
 */

#ifndef HANDLER_H_
#define HANDLER_H_
#include <xercesc/sax/HandlerBase.hpp>
#include <xercesc/parsers/SAXParser.hpp>
#include <xercesc/sax/HandlerBase.hpp>
#include <xercesc/util/XMLString.hpp>
#include <ctime>
#include <stdio.h>
#include <iostream>
#include <list>

using namespace std;
using namespace xercesc;

#include "VmsRecord.h"


class Handler: public HandlerBase {

public:
	Handler(void);
	void startElement(const XMLCh* const, AttributeList&);
	void endElement(const XMLCh* const);
	void characters(const XMLCh* const chars, const XMLSize_t length);
	std::list<VmsRecord*> * getValues();
private:
	XMLCh * timeLastSet;
	XMLCh * vmsTextLine;
	XMLCh * vmsUnit;
	XMLCh * pictogramCode;
	XMLCh * id;
	XMLCh * vmsUnitReference;
	const XMLCh * buffer;
	std::list<VmsRecord*> * values;
	VmsRecord * current;

};

#endif /* HANDLER_H_ */
