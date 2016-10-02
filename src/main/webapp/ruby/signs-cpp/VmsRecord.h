/*
 * VmsRecord.h
 *
 *  Created on: 14 Mar 2016
 *      Author: adam
 */

#ifndef VMSRECORD_H_
#define VMSRECORD_H_

#include <stdint.h>

struct VmsRecord {
	unsigned long int timestamp;
	uint8_t code;
	char ** text;
	unsigned int lines;
	char * guid;
	int16_t id;
};

#endif /* VMSRECORD_H_ */
