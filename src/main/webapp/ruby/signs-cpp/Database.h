/*
 * Database.h
 *
 *  Created on: 16 Feb 2016
 *      Author: adam
 */

#ifndef DATABASE_H_
#define DATABASE_H_

#include "VmsRecord.h"
#include <list>
#include "GuidLookup.h"
#include <fstream>
using namespace std;

class Database {
public:
	Database();
	virtual ~Database();
	void update(std::list<VmsRecord*> *);
	void debug(std::list<VmsRecord*> *);
	void toJson();
	uint64_t toJsonAge();
	void init();
private:
	GuidLookup * guidLookup;
	const char * filename;
	const char * filenameJson;
	
	void write(VmsRecord *, fstream * out);
	int recordSize;
};

#endif /* DATABASE_H_ */
