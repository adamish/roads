/*
 * GuidLookup.h
 */

#ifndef GuidLookup_H_
#define GuidLookup_H_

#include <string>
#include <stdint.h>

class GuidLookup {
public:
	GuidLookup();
	virtual ~GuidLookup();
	int lookup(const std::string&);
	void init();
	int getCount();
	signed int compare(uint64_t aUpper, uint64_t aLower, uint64_t bUpper, uint64_t bLower);
private:
	const char * filename;
	char * buffer;
	int length;
	int recordSize;
};

#endif /* GuidLookup_H_ */
