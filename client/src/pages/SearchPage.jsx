import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMusicians,
  selectAllMusicians,
  selectMusicianLoading,
  addToProspects,
} from "../redux/slices/musicianSlice";
import {
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import debounce from "lodash/debounce";
import { toast } from "sonner";

const SearchPage = () => {
  const dispatch = useDispatch();
  const musicians = useSelector(selectAllMusicians);
  const isLoading = useSelector(selectMusicianLoading);

  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    homebase: "",
    capacityRange: [0, 10000],
    agent: "",
    agency: "",
    active: "",
  });
  const musiciansPerPage = 12;

  // Fetch musicians on component mount
  useEffect(() => {
    dispatch(fetchMusicians());
  }, [dispatch]);

  // Filter musicians based on search criteria
  const filteredMusicians = musicians.filter((musician) => {
    return (
      (filters.search === "" ||
        musician.actName.toLowerCase().includes(filters.search.toLowerCase()) ||
        musician.homebase
          .toLowerCase()
          .includes(filters.search.toLowerCase())) &&
      (filters.genre === "" || musician.genre === filters.genre) &&
      (filters.homebase === "" || musician.homebase === filters.homebase) &&
      musician.averageVenueCapacity >= filters.capacityRange[0] &&
      musician.averageVenueCapacity <= filters.capacityRange[1] &&
      (filters.agent === "" || musician.agent === filters.agent) &&
      (filters.agency === "" || musician.agency === filters.agency) &&
      (filters.active === "" || musician.active === (filters.active === "true"))
    );
  });

  // Pagination calculations
  const indexOfLastMusician = currentPage * musiciansPerPage;
  const indexOfFirstMusician = indexOfLastMusician - musiciansPerPage;
  const currentMusicians = filteredMusicians.slice(
    indexOfFirstMusician,
    indexOfLastMusician
  );
  const totalPages = Math.ceil(filteredMusicians.length / musiciansPerPage);

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, 300);

  const handleAddToProspects = async (musicianId) => {
    try {
      const resultAction = await dispatch(addToProspects(musicianId));
      if (addToProspects.fulfilled.match(resultAction)) {
        toast.success("Successfully added musician to prospect list");
      } else {
        toast.error("Failed to add to prospects");
      }
    } catch (error) {
      toast.error("Error adding to prospects");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search and Filter Section */}
      <div className="p-4 bg-white shadow-md">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search Bar */}
          <TextField
            fullWidth
            label="Search musicians..."
            variant="outlined"
            onChange={(e) => debouncedSearch(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Genre Filter */}
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={filters.genre}
                label="Genre"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, genre: e.target.value }))
                }
              >
                <MenuItem value="">All Genres</MenuItem>
                <MenuItem value="Rock">Rock</MenuItem>
                <MenuItem value="Jazz">Jazz</MenuItem>
                <MenuItem value="Pop">Pop</MenuItem>
                <MenuItem value="Classical">Classical</MenuItem>
                {/* Add more genres */}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.homebase}
                label="Location"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, homebase: e.target.value }))
                }
              >
                <MenuItem value="">All Locations</MenuItem>
                {/* Add unique locations from musicians */}
                {[...new Set(musicians.map((m) => m.homebase))].map(
                  (location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* Active Status Filter */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.active}
                label="Status"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, active: e.target.value }))
                }
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Agency Filter */}
            <FormControl fullWidth>
              <InputLabel>Agency</InputLabel>
              <Select
                value={filters.agency}
                label="Agency"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, agency: e.target.value }))
                }
              >
                <MenuItem value="">All Agencies</MenuItem>
                {[...new Set(musicians.map((m) => m.agency))].map((agency) => (
                  <MenuItem key={agency} value={agency}>
                    {agency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Venue Capacity Slider */}
            <div className="col-span-full">
              <p>Venue Capacity Range</p>
              <Slider
                value={filters.capacityRange}
                onChange={(e, newValue) =>
                  setFilters((prev) => ({ ...prev, capacityRange: newValue }))
                }
                valueLabelDisplay="auto"
                min={0}
                max={10000}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Musicians Grid */}
      <div className="flex-grow p-4 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMusicians.map((musician) => (
                  <div
                    key={musician.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">
                          {musician.actName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            musician.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {musician.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-600">Genre: {musician.genre}</p>
                        <p className="text-gray-600">
                          Location: {musician.homebase}
                        </p>
                        <p className="text-gray-600">
                          Venue Capacity: {musician.averageVenueCapacity}
                        </p>
                        <p className="text-gray-600">Agent: {musician.agent}</p>
                        <p className="text-gray-600">
                          Agency: {musician.agency}
                        </p>
                      </div>
                      <div className="mt-4 border-t pt-4">
                        <button
                          onClick={() => handleAddToProspects(musician.id)}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                          Add to Prospects
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-8 space-x-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
