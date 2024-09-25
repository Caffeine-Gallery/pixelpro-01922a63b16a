import ExperimentalCycles "mo:base/ExperimentalCycles";
import Hash "mo:base/Hash";

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

actor ImageEditor {
    private stable var imageEntries : [(Text, Blob)] = [];
    private var images = HashMap.HashMap<Text, Blob>(10, Text.equal, Text.hash);

    system func preupgrade() {
        imageEntries := Iter.toArray(images.entries());
    };

    system func postupgrade() {
        images := HashMap.fromIter<Text, Blob>(imageEntries.vals(), 10, Text.equal, Text.hash);
        imageEntries := [];
    };

    public shared(msg) func uploadImage(name: Text, data: Blob) : async Result.Result<(), Text> {
        if (images.size() >= 100) {
            return #err("Storage limit reached");
        };
        images.put(name, data);
        #ok(())
    };

    public query func getImage(name: Text) : async Result.Result<Blob, Text> {
        switch (images.get(name)) {
            case null { #err("Image not found") };
            case (?image) { #ok(image) };
        }
    };

    public query func listImages() : async [Text] {
        Iter.toArray(images.keys())
    };

    public shared(msg) func deleteImage(name: Text) : async Result.Result<(), Text> {
        switch (images.remove(name)) {
            case null { #err("Image not found") };
            case (_) { #ok(()) };
        }
    };
}
