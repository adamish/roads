/*
 * GuidLookup.cpp
 *
 *  Created on: 16 Feb 2016
 *      Author: adam
 */

#include "GuidLookup.h"
#include <fstream>
#include <iostream>
#include <sys/stat.h>
#include <string>
#include <stdlib.h>     /* atoi */
#include <stdint.h>

using namespace std;

GuidLookup::GuidLookup() {
	filename = "../../app/signs-guids";
	buffer = NULL;
	length = 0;
	recordSize = 8 * 3;
}

GuidLookup::~GuidLookup() {
}

void GuidLookup::init() {
	fstream fout;
	fout.open(filename, fstream::binary | fstream::in);

	struct stat stat_buf;
	int rc = stat(filename, &stat_buf);
	if (rc == -1) {
	  cerr << "Could not read " << filename << "\n";
	  return;
	}
	int fileSize = stat_buf.st_size;

	buffer = new char[fileSize];
	fout.read(buffer, fileSize);
	length = fileSize / recordSize;
	fout.close();
}

int GuidLookup::lookup(const std::string& str) {
	int rc = -1;

	// FC82E8BAC4387272 E0438DC611AC3F8D
	// 0             15 16            31

	uint64_t lower = 0;
	for (int i = 0; i < 15; i += 2) {
		const char * substr = str.substr(30 - i, 2).c_str();
		uint64_t byte = strtol(substr, NULL, 16);
		lower = lower | (byte << (i * 4));
	}

	uint64_t upper = 0;
	for (int i = 16; i < 32; i += 2) {
		const char * substr = str.substr(30 - i, 2).c_str();
		uint64_t byte = strtol(substr, NULL, 16);
		upper = upper | (byte << (i * 4));
	}


	int n1 = 0;
	int n2 = length - 1;

	while (n1 <= n2) {
		int nMid = (n2 + n1) / 2;
		uint64_t * nMidPtr = (uint64_t *) (buffer + nMid * recordSize);

		uint64_t nMidLower = *(nMidPtr);
		uint64_t nMidUpper = *(nMidPtr + 1);

//		cout << hex;
//		cout << nMidUpper << nMidLower << "," << n1 << "," << n2 << "\n";
//		cout << dec;

		int compareResult = compare(upper, lower, nMidUpper, nMidLower);
		if (compareResult < 0) {
			n2 = nMid - 1;
		} else if (compareResult > 0) {
			n1 = nMid + 1;
		} else {
			rc = *(nMidPtr + 2);
			break;
		}
	}

	return rc;
}

int GuidLookup::getCount() {
	return length;
}


/**
 * -1 if a less than b, 0 if equal, 1 if a more than b
 */
signed int GuidLookup::compare(uint64_t aUpper, uint64_t aLower, uint64_t bUpper,
		uint64_t bLower) {
	if (aUpper > bUpper) {

		return 1;
	} else if (aUpper < bUpper) {
		return -1;
	} else {
		if (aLower > bLower) {
			return 1;
		} else if (aLower < bLower) {
			return -1;
		} else {
			return 0;
		}
	}
}

