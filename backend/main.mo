import Bool "mo:base/Bool";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import Hash "mo:base/Hash";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor ImageEditor {
    private stable var imageEntries : [(Text, Blob)] = [];
    private var images = HashMap.HashMap<Text, Blob>(10, Text.equal, Text.hash);
    private stable var userImageEntries : [(Principal, [Text])] = [];
    private var userImages = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

    system func preupgrade() {
        imageEntries := Iter.toArray(images.entries());
        userImageEntries := Iter.toArray(userImages.entries());
    };

    system func postupgrade() {
        images := HashMap.fromIter<Text, Blob>(imageEntries.vals(), 10, Text.equal, Text.hash);
        userImages := HashMap.fromIter<Principal, [Text]>(userImageEntries.vals(), 10, Principal.equal, Principal.hash);
        imageEntries := [];
        userImageEntries := [];
    };

    public shared(msg) func uploadImage(name: Text, data: [Nat8]) : async Result.Result<(), Text> {
        if (images.size() >= 1000) {
            return #err("Storage limit reached");
        };
        let imageBlob = Blob.fromArray(data);
        images.put(name, imageBlob);
        
        let userPrincipal = msg.caller;
        switch (userImages.get(userPrincipal)) {
            case null {
                userImages.put(userPrincipal, [name]);
            };
            case (?userImageList) {
                userImages.put(userPrincipal, Array.append(userImageList, [name]));
            };
        };
        
        #ok(())
    };

    public query func getImage(name: Text) : async Result.Result<[Nat8], Text> {
        switch (images.get(name)) {
            case null { #err("Image not found") };
            case (?image) { #ok(Blob.toArray(image)) };
        }
    };

    public query(msg) func listImages() : async [Text] {
        switch (userImages.get(msg.caller)) {
            case null { [] };
            case (?userImageList) { userImageList };
        }
    };

    public shared(msg) func deleteImage(name: Text) : async Result.Result<(), Text> {
        switch (images.remove(name)) {
            case null { #err("Image not found") };
            case (_) { 
                switch (userImages.get(msg.caller)) {
                    case null { };
                    case (?userImageList) {
                        let updatedList = Array.filter(userImageList, func (imageName: Text) : Bool {
                            imageName != name
                        });
                        userImages.put(msg.caller, updatedList);
                    };
                };
                #ok(()) 
            };
        }
    };

    public query func getStorageUsage() : async Nat {
        var totalSize = 0;
        for ((_, image) in images.entries()) {
            totalSize += Blob.toArray(image).size();
        };
        totalSize
    };

    public shared(msg) func clearAllImages() : async () {
        assert(msg.caller == Principal.fromText("aaaaa-aa"));
        images := HashMap.HashMap<Text, Blob>(10, Text.equal, Text.hash);
        userImages := HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
    };
}
