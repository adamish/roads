/*
 * Database.cpp
 *
 *  Created on: 16 Feb 2016
 *      Author: adam
 */

#include "Database.h"
#include <fstream>
#include <iostream>
#include <string>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>

using namespace std;

Database::Database() {
	filename = "database.bin";
	filenameJson = "../../app/sign-settings.tmp";
	
	guidLookup = new GuidLookup();
	guidLookup->init();
	recordSize = 1 + 1 + 8 + 4 * 16;
}

Database::~Database() {
}

void Database::debug(std::list<VmsRecord*> * values) {
	std::list<VmsRecord*>::const_iterator iterator;
	for (iterator = values->begin(); iterator != values->end(); ++iterator) {

		(*iterator)->id = guidLookup->lookup((*iterator)->guid);

		cout << (int) (*iterator)->code << ", time "
				<< (int) (*iterator)->timestamp << ", " << (*iterator)->id
				<< ", " << (*iterator)->guid << "\n";
		for (int i = 0; i < (*iterator)->lines; i++) {
			cout << (*iterator)->text[i] << ",";

		}
		cout << "\n";
	}
}

bool idSort(VmsRecord * a, VmsRecord * b) {
	return a->id < b->id;
}

void Database::update(std::list<VmsRecord*> * values) {

	this->init();
	fstream fout;
	fout.open(filename, fstream::binary | fstream::out | fstream::in);

	std::list<VmsRecord*>::const_iterator iterator;
	for (iterator = values->begin(); iterator != values->end(); ++iterator) {
		(*iterator)->id = guidLookup->lookup((*iterator)->guid);
		write((*iterator), &fout);
	}
	values->sort(idSort);
//	this->debug(values);
	fout.close();
}

void Database::write(VmsRecord * value, fstream * out) {
	// code (1byte)
	// text lines (1 byte)
	// text - max ( 4 x 15)
	if (value->id == -1) {
		return;
	}
	char * buffer = new char[2];

	out->seekp(value->id * recordSize);
	out->write((char *) (&value->code), 1);
	out->write((char *) (&value->lines), 1);
	out->write(buffer, 2);

	out->write((char *) (&value->timestamp), 8);

	for (int i = 0; i < value->lines; i++) {
		out->write(value->text[i], 1 + strlen(value->text[i]));
	}
}

uint64_t Database::toJsonAge() {
	struct stat statbuf;
	if (stat(filenameJson, &statbuf) == -1) {

	}
	time_t now;
	time(&now);
	uint64_t fileTime = statbuf.st_mtime;
	return now - fileTime;
}

void Database::toJson() {
	cout << "Writing to JSON\n";
	fstream fout;
	fstream fin;

	fin.open(filename, fstream::binary | fstream::in);
	fout.open(filenameJson, fstream::binary | fstream::out);

	char * buffer = new char[recordSize];

	const char * lookup[256];

	for (int i = 0; i < 256; i++) {
		lookup[i] = "udf";
	}
	lookup[0] = "off";
	lookup[1] = "off";
	lookup[2] = "nr";
	lookup[3] = "re";
	lookup[4] = "stop";
	lookup[5] = "20";
	lookup[6] = "30";
	lookup[7] = "40";
	lookup[8] = "50";
	lookup[9] = "60";
	lookup[10] = "70";
	lookup[10] = "80";
	lookup[11] = "90";
	lookup[12] = "100";
	lookup[13] = "120";

	lookup[14] = "ldr";
	lookup[15] = "redx";
	lookup[16] = "ldl";
	lookup[17] = "mdl";

	lookup[21] = "1t";
	lookup[22] = "t1";
	lookup[23] = "tt1";
	lookup[24] = "t11";
	lookup[25] = "1tt";
	lookup[26] = "11t";
	lookup[27] = "open";

	lookup[37] = "20r";
	lookup[38] = "30r";
	lookup[39] = "40r";
	lookup[40] = "50r";
	lookup[41] = "60r";
	lookup[42] = "70r";
	lookup[43] = "80r";
	lookup[44] = "90r";
	lookup[45] = "100r";
	lookup[46] = "120r";

	lookup[52] = "ldl";
	lookup[54] = "ldl";

	lookup[56] = "tt";

	lookup[59] = "redx";

	lookup[255] = "udf";

	char * temp = new char[256];
	char * linesStr = new char[256];

	const char * start = "{\"content\":[";
	fout.write(start, strlen(start));
	bool first = true;

	for (int i = 0; i < guidLookup->getCount(); i++) {
		fin.seekp(i * recordSize);
		fin.read(buffer, recordSize);

		uint8_t code = *(uint8_t *) buffer;
		uint8_t lines = *(uint8_t *) (buffer + 1);
		uint64_t timestamp = *(uint64_t *) (buffer + 4);

		if (lines > 0) {

			if (!first) {
				fout.put(',');
			}

			char * txt = buffer + 12;
			char * linesStrTemp = linesStr;
			for (int k = 0; k < lines; k++) {
				*linesStrTemp = '"';
				linesStrTemp++;
				strcpy(linesStrTemp, txt);
				linesStrTemp += strlen(txt);
				*linesStrTemp = '"';
				linesStrTemp++;
				if (k < lines - 1) {
					*linesStrTemp = ',';
					linesStrTemp++;
				}
				txt = txt + strlen(txt) + 1;
			}
			*linesStrTemp = 0;
			// {"time":1449509157,"value":"40","id":6406}
			sprintf(temp, "{\"time\":%ld,\"value\":[%s],\"id\":%d}", timestamp,
					linesStr, i);
			fout.write(temp, strlen(temp));
			first = false;
		} else if (code > 1) {

			if (!first) {
				fout.put(',');
			}
			// {"time":1449509157,"value":"40","id":6406}
			sprintf(temp, "{\"time\":%ld,\"value\":\"%s\",\"id\":%d}",
					timestamp, lookup[code], i);

			fout.write(temp, strlen(temp));

			first = false;
		}

	}
	fout.put(']');
	fout.put('}');
	fout.close();
	fin.close();
}

void Database::init() {
	if (access(filename, F_OK) != -1) {
		return;
	}

	fstream fout;
	fout.open(filename, fstream::binary | fstream::out);
	char * buff = new char[recordSize];
	buff[0] = 0x0;
	buff[1] = 0x0;
	for (int i = 2; i < recordSize; i++) {
		buff[i] = 0;
	}
	for (int i = 0; i < guidLookup->getCount(); i++) {
		fout.seekp(i * recordSize);
		fout.write(buff, recordSize);
	}
	fout.close();
}
