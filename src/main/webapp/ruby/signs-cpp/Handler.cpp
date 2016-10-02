/*
 * Handler.cpp
 *
 *  Created on: 21 Feb 2016
 *      Author: adam
 */

#include <xercesc/util/XMLString.hpp>
#include <ctime>
#include <stdio.h>
#include <iostream>

#ifndef HANDLER_CPP_
#define HANDLER_CPP_

#include "Handler.h"

Handler::Handler(void) {
	timeLastSet = XMLString::transcode("timeLastSet");
	vmsTextLine = XMLString::transcode("vmsTextLine");
	pictogramCode = XMLString::transcode("pictogramCode");
	vmsUnitReference = XMLString::transcode("vmsUnitReference");
	vmsUnit = XMLString::transcode("vmsUnit");
	id = XMLString::transcode("vmsUnitReference");
	values = new std::list<VmsRecord*>();
	buffer = NULL;
	current = NULL;
}

void Handler::characters(const XMLCh* const chars,
		const XMLSize_t length) {
	buffer = chars;
}

std::list<VmsRecord*> * Handler::getValues() {
	return values;
}


void Handler::startElement(const XMLCh* const name, AttributeList& list) {
	if (XMLString::endsWith(name, vmsUnitReference)) {
		char * str = XMLString::transcode(list.getValue("id"));
		current->guid = str;
	} else if (XMLString::endsWith(name, vmsUnit)) {
		current = new VmsRecord();
		current->lines = (int)0;
		values->push_back(current);
		current->text = (char **)malloc(4 * sizeof(char*));
	}
}

void Handler::endElement(const XMLCh* const name) {
	XMLCh* copy = new XMLCh[24];

	if (XMLString::endsWith(name, timeLastSet)) {
		char * str = XMLString::transcode(buffer);

		int y, M, d, h, m;
		float s;
		sscanf(str, "%d-%d-%dT%d:%d:%fZ", &y, &M, &d, &h, &m, &s);
		tm time;
		time.tm_year = y - 1900; // Year since 1900
		time.tm_mon = M - 1;     // 0-11
		time.tm_mday = d;        // 1-31
		time.tm_hour = h;        // 0-23
		time.tm_min = m;         // 0-59
		time.tm_sec = (int) s;    // 0-61 (0-60 in C++11)
		time_t t = mktime(&time);
		unsigned long int sec = t;
		current->timestamp = sec;
	} else if (XMLString::endsWith(name, vmsTextLine) && buffer != NULL) {
		XMLString::copyString(copy, buffer);
		XMLString::trim(copy);
		if (XMLString::stringLen(copy) > 0) {
			char * str = XMLString::transcode(copy);
			if (str[0] == 'S' && str[1] == 'Y') {
				char * out = new char[5];
				strncpy(out, str, 4);
				out[5] = 0;
				current->text[(current->lines)++] = out;
				if (strlen(str) > 4) {
					char * remaining = str + 4;
					current->text[(current->lines)++] = remaining;
				}
			} else {
				current->text[(current->lines)++] = str;
			}
		}
	} else if (XMLString::endsWith(name, pictogramCode)) {
		current->code = atoi(XMLString::transcode(buffer));
	}
	buffer = NULL;
}

#endif /* HANDLER_CPP_ */
