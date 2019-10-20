#include "console.h"

#include <KR3/wl/windows.h>

using namespace kr;
namespace
{
	int s_consoleColor;
}

JsValue createConsoleModule() noexcept
{
	static const HANDLE output = GetStdHandle(STD_OUTPUT_HANDLE);  // Get handle to standard output

	{
		CONSOLE_SCREEN_BUFFER_INFO info;
		if (!GetConsoleScreenBufferInfo(output, &info))
			return false;
		s_consoleColor = info.wAttributes;
	}

	JsValue console = JsNewObject;

	console.setMethod(u"log", [](Text16 message) {
		ucout << message << endl;
	});
	console.setMethod(u"setTextAttribute", [](int color) {
		SetConsoleTextAttribute(output, color);
		s_consoleColor = color;
	});
	console.setMethod(u"getTextAttribute", []() {
		return s_consoleColor;
	});

	console.set(u"FOREGROUND_BLUE", FOREGROUND_BLUE);
	console.set(u"FOREGROUND_GREEN", FOREGROUND_GREEN);
	console.set(u"FOREGROUND_RED", FOREGROUND_RED);
	console.set(u"FOREGROUND_INTENSITY", FOREGROUND_INTENSITY);
	console.set(u"BACKGROUND_BLUE", BACKGROUND_BLUE);
	console.set(u"BACKGROUND_GREEN", BACKGROUND_GREEN);
	console.set(u"BACKGROUND_RED", BACKGROUND_RED);
	console.set(u"BACKGROUND_INTENSITY", BACKGROUND_INTENSITY);
	return console;
}