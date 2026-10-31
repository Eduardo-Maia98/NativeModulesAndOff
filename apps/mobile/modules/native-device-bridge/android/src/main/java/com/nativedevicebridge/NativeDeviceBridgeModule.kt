package com.nativedevicebridge

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap

class NativeDeviceBridgeModule(reactContext: ReactApplicationContext) :
  NativeNativeDeviceBridgeSpec(reactContext) {

  override fun getSnapshot(): WritableMap {
    val snapshot = Arguments.createMap()
    snapshot.putString("platform", "android")
    snapshot.putString("model", "${Build.MANUFACTURER} ${Build.MODEL}")
    snapshot.putBoolean("isEmulator", isEmulator())
    snapshot.putDouble("nativeTimestamp", System.currentTimeMillis().toDouble())
    return snapshot
  }

  override fun echo(message: String): String {
    return "[native] $message"
  }

  private fun isEmulator(): Boolean {
    return Build.FINGERPRINT.startsWith("generic") ||
      Build.FINGERPRINT.startsWith("unknown") ||
      Build.MODEL.contains("google_sdk", ignoreCase = true) ||
      Build.MODEL.contains("Emulator", ignoreCase = true) ||
      Build.MODEL.contains("Android SDK built for") ||
      Build.MANUFACTURER.contains("Genymotion", ignoreCase = true) ||
      (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
      Build.PRODUCT == "google_sdk"
  }

  companion object {
    const val NAME = NativeNativeDeviceBridgeSpec.NAME
  }
}
