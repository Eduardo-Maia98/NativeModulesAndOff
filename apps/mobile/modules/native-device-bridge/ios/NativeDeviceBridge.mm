#import "NativeDeviceBridge.h"

#import <UIKit/UIKit.h>
#include <TargetConditionals.h>
#include <sys/utsname.h>

@implementation NativeDeviceBridge

- (NSDictionary *)getSnapshot
{
  struct utsname systemInfo;
  uname(&systemInfo);
  NSString *model = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
  if (model.length == 0) {
    model = UIDevice.currentDevice.model ?: @"unknown";
  }

  BOOL isSimulator = NO;
#if TARGET_OS_SIMULATOR
  isSimulator = YES;
#endif

  return @{
    @"platform": @"ios",
    @"model": model,
    @"isEmulator": @(isSimulator),
    @"nativeTimestamp": @([[NSDate date] timeIntervalSince1970] * 1000.0)
  };
}

- (NSString *)echo:(NSString *)message
{
  return [NSString stringWithFormat:@"[native] %@", message ?: @""];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeNativeDeviceBridgeSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"NativeDeviceBridge";
}

@end
